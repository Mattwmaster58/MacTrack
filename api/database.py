from pathlib import Path

from litestar import Litestar
from litestar.contrib.sqlalchemy.plugins import SQLAlchemyAsyncConfig, SQLAlchemyInitPlugin, \
    SQLAlchemySerializationPlugin
from litestar.contrib.sqlalchemy.plugins.init.config.sync import autocommit_before_send_handler

from data.base import Base, EXCLUDE_FROM_CREATION_KEY
from data.mac_bid.fts5 import create_fts_table_and_triggers
from data.mac_bid import AuctionLot
# strictly to execute code so those tables get attached to the base and tables get created
from data.user import *
from typings import AsyncDbEngine


def create_all_respecting_table_flags(bind: AsyncDbEngine) -> None:
    """Creates all, but excludes those with the attr of the name of the value of EXCLUDE_FROM_CREATION_KEY set to True"""
    # take note of the double negative here :|
    tables = [x for x in Base.metadata.tables.values() if not getattr(x, EXCLUDE_FROM_CREATION_KEY, False)]
    return Base.metadata.create_all(bind, tables)


async def init_db_from_app(_app: Litestar) -> None:
    return await init_db_from_engine(getattr(_app.state, SQLAlchemyAsyncConfig.engine_app_state_key))


async def init_db_from_engine(engine: AsyncDbEngine) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(create_all_respecting_table_flags)
        fts_statements = create_fts_table_and_triggers(
            table=AuctionLot.__table__,
            fts_cols={AuctionLot.product_name, AuctionLot.title, AuctionLot.description},
            version=5,
        )
        # sqlite doesn't allow multiple statements per execute, so use the underlying connections executescript API
        # noinspection PyUnresolvedReferences
        raw_conn = await conn.get_raw_connection()
        await raw_conn.connection._connection.executescript(str(fts_statements))


def create_async_db_config(db_path_: Path):
    return SQLAlchemyAsyncConfig(
        connection_string=f"sqlite+aiosqlite:///{db_path_}",
        before_send_handler=autocommit_before_send_handler,
    )


db_path = Path(__file__).parent / "mac.bid.db"
async_db_config = create_async_db_config(db_path)
_init_db_plugin = SQLAlchemyInitPlugin(config=async_db_config)
db_plugins = [_init_db_plugin, SQLAlchemySerializationPlugin()]
