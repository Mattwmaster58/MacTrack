from pathlib import Path

from litestar import Litestar
from litestar.contrib.sqlalchemy.plugins import SQLAlchemyAsyncConfig, SQLAlchemyInitPlugin, \
    SQLAlchemySerializationPlugin
from litestar.contrib.sqlalchemy.plugins.init.config.sync import autocommit_before_send_handler

from data import Base, create_fts_table_and_triggers, AuctionLot
from typings import AsyncDbEngine


async def init_db_from_app(_app: Litestar) -> None:
    return await init_db_from_engine(getattr(_app.state, SQLAlchemyAsyncConfig.engine_app_state_key))


async def init_db_from_engine(engine: AsyncDbEngine) -> None:
    async with engine.begin() as conn:
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


def create_async_db_config(db_path: Path):
    return SQLAlchemyAsyncConfig(
        connection_string=f"sqlite+aiosqlite:///{db_path}",
        before_send_handler=autocommit_before_send_handler,
    )


db_path = Path(__file__).parent / "mac.bid.db"
async_db_config = create_async_db_config(db_path)
_init_db_plugin = SQLAlchemyInitPlugin(config=async_db_config)
db_plugins = [_init_db_plugin, SQLAlchemySerializationPlugin()]
