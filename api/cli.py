import asyncio
import atexit
from pathlib import Path

import click

from database import init_db_from_engine, create_async_db_config
from scraper.db_cleanup import db_cleanup
from scraper.updater import MacBidUpdater


async def session_from_db_path(db_path: Path):
    config = create_async_db_config(db_path)
    engine = config.create_engine_callable(config.connection_string)
    await init_db_from_engine(engine)
    session = config.create_session_maker()()

    def _closer():
        async def _acloser():
            await session.close()
            await engine.dispose()

        return asyncio.new_event_loop().run_until_complete(_acloser())

    atexit.register(_closer)
    return session


async def _update(db_path: Path, skip_cleanup: bool):
    session = await session_from_db_path(db_path)
    mbc = MacBidUpdater(session)
    if not skip_cleanup:
        await db_cleanup(mbc.session)
    await mbc.sync_db()


@click.command()
@click.option("--db-path", default=Path(__file__).parent / "mac.bid.db", type=click.Path())
@click.option("--skip-cleanup", default=False, is_flag=True)
def update(db_path: Path, skip_cleanup: bool):
    db_path = Path(db_path).absolute()
    asyncio.run(_update(db_path, skip_cleanup))


if __name__ == "__main__":
    update()
