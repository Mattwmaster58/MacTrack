from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from litestar import Litestar
from litestar.config.compression import CompressionConfig
from litestar.config.cors import CORSConfig
from litestar.contrib.sqlalchemy.plugins import SQLAlchemySerializationPlugin
from litestar.datastructures import State
from litestar.exceptions import ClientException
from litestar.status_codes import HTTP_409_CONFLICT
from sqlalchemy import ext
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from data import Base, create_fts_table_and_triggers, AuctionLot
from routes.data.search import search


@asynccontextmanager
async def db_connection(_app: Litestar) -> AsyncGenerator[None, None]:
    engine = getattr(_app.state, "engine", None)
    if engine is None:
        db_path = Path(__file__).parent / "mac.bid.db"
        engine = create_async_engine(
            f"sqlite+aiosqlite:///{db_path.as_posix()}", echo=True
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            fts_statements = create_fts_table_and_triggers(
                table=AuctionLot.__table__,
                fts_cols={AuctionLot.product_name, AuctionLot.title, AuctionLot.description},
                version=5
            )
            # sqlite doesn't allow multiple statements per execute, so use the underlying connections executescript API
            # noinspection PyUnresolvedReferences
            raw_conn = (await conn.get_raw_connection())
            await raw_conn.connection._connection.executescript(str(fts_statements))
            print("created FTS mirror")
        _app.state.engine = engine
    try:
        yield
    finally:
        await engine.dispose()


async def provide_db(state: State) -> AsyncGenerator[ext.asyncio.engine, None]:
    return state.engine


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

cors_config = CORSConfig(allow_origins=["http://localhost:3000"])
app = Litestar(
    route_handlers=[search],
    dependencies={"tx": provide_transaction, "db": provide_db},
    lifespan=[db_connection],
    plugins=[SQLAlchemySerializationPlugin()],
    cors_config=cors_config,
    compression_config=CompressionConfig(backend="brotli")
)
