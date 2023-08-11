import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from litestar import Litestar
from litestar.config.compression import CompressionConfig
from litestar.config.cors import CORSConfig
from litestar.contrib.sqlalchemy.plugins import SQLAlchemySerializationPlugin, SQLAlchemyPlugin, SQLAlchemyAsyncConfig
from litestar.datastructures import State
from litestar.exceptions import ClientException
from litestar.status_codes import HTTP_409_CONFLICT
from litestar.types import Logger
from sqlalchemy import ext
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from litestar.logging import LoggingConfig

from data import Base, create_fts_table_and_triggers, AuctionLot
from routes.auth.session import signup, login, session_auth
from routes.data.search import search

session_maker = async_sessionmaker(expire_on_commit=False)


async def provide_transaction(state: State) -> AsyncGenerator[AsyncSession, None]:
    async with session_maker(bind=state.engine) as session:
        try:
            async with session.begin():
                yield session

        except IntegrityError as exc:
            raise ClientException(
                status_code=HTTP_409_CONFLICT,
                detail=str(exc),
            ) from exc


async def _init_db(_app: Litestar) -> None:
    async with _app.state.db_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        fts_statements = create_fts_table_and_triggers(
            table=AuctionLot.__table__,
            fts_cols={AuctionLot.product_name, AuctionLot.title, AuctionLot.description},
            version=5,
        )
        # sqlite doesn't allow multiple statements per execute, so use the underlying connections executescript API
        # noinspection PyUnresolvedReferences
        raw_conn = await conn.get_raw_connection()
        await raw_conn.connection._connection.executescript(str(fts_statements))


db_path = Path(__file__).parent / "mac.bid.db"
config = SQLAlchemyAsyncConfig(connection_string=f"sqlite+aiosqlite:///{db_path.as_posix()}")
plugin = SQLAlchemyPlugin(config=config)
cors_config = CORSConfig(allow_origins=["http://localhost:3000"])
# logging_config = StructLoggingConfig()

logging_config = LoggingConfig(
    loggers={
        "MacFlashback": {
            "level": "DEBUG",
            "handlers": ["queue_listener"],
        }
    }
)
app = Litestar(
    route_handlers=[search, login, signup],
    dependencies={"tx": provide_transaction},
    plugins=[SQLAlchemyPlugin(config=config), SQLAlchemySerializationPlugin()],
    cors_config=cors_config,
    compression_config=CompressionConfig(backend="brotli"),
    on_app_init=[session_auth.on_app_init],
    on_startup=[_init_db],
    logging_config=logging_config,
    # debug=True,  # required until this is fixed: https://github.com/litestar-org/litestar/issues/1804
)
