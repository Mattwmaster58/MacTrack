import itertools
from pathlib import Path
from typing import AsyncGenerator

from litestar import Litestar, Router
from litestar.config.compression import CompressionConfig
from litestar.config.cors import CORSConfig
from litestar.contrib.sqlalchemy.plugins import SQLAlchemyPlugin, SQLAlchemyAsyncConfig
from litestar.datastructures import State
from litestar.exceptions import ClientException
from litestar.status_codes import HTTP_409_CONFLICT
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from litestar.contrib.sqlalchemy.plugins.init.config.sync import autocommit_before_send_handler

from data import Base, create_fts_table_and_triggers, AuctionLot
from routes.auth import signup, login, create_session_auth, current_user
from routes.data.search import search

session_maker = async_sessionmaker(expire_on_commit=False)


async def provide_transaction(state: State) -> AsyncGenerator[AsyncSession, None]:
    async with session_maker(bind=state.db_engine) as session:
        try:
            async with session.begin():
                yield session
        except IntegrityError as exc:
            raise ClientException(
                status_code=HTTP_409_CONFLICT,
                detail=str(exc),
            ) from exc


async def _init_db(app: Litestar) -> None:
    async with app.state.db_engine.begin() as conn:
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
async_db_config = SQLAlchemyAsyncConfig(
    connection_string=f"sqlite+aiosqlite:///{db_path}",
    before_send_handler=autocommit_before_send_handler,
)
db_plugin = SQLAlchemyPlugin(config=async_db_config)
cors_config = CORSConfig(allow_origins=["http://localhost:3000"])
# logging_config = StructLoggingConfig()

# logging_config = LoggingConfig(
#     loggers={
#         "MacFlashback": {
#             "level": "DEBUG",
#             "handlers": ["queue_listener"],
#         }
#     }
# )
API_ROOT = "/api"
auth_excluded_routes = [search, login, signup]
auth_excluded_paths = [API_ROOT + p for p in itertools.chain(x.paths for x in auth_excluded_routes)]
session_auth = create_session_auth(auth_excluded_routes)
api_routes = [*auth_excluded_paths, current_user]
api_router = Router(path=API_ROOT, route_handlers=api_routes)

app = Litestar(
    route_handlers=[api_router],
    dependencies={"tx": provide_transaction},
    plugins=[db_plugin],
    cors_config=cors_config,
    compression_config=CompressionConfig(backend="brotli"),
    on_startup=[_init_db],
    on_app_init=[session_auth.on_app_init],
    # logging_config=logging_config,
    debug=True,  # required until this is fixed: https://github.com/litestar-org/litestar/issues/1804
)
