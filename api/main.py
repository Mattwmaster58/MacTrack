from pathlib import Path

import click

from data import create_and_connect
from updater import MacBidUpdater


@click.command()
@click.option("--db-path", default=Path(__file__).parent / "mac.bid.db", type=click.Path())
def update(db_path: Path):
    db_path = Path(db_path).absolute()
    engine = create_and_connect(db_path)
    mbc = MacBidUpdater(engine)
    mbc.correct_auction_groups()
    mbc.update_locations()
    mbc.update_buildings()
    mbc.update_auction_groups()
    mbc.update_final_auction_lots()
    mbc.update_live_auction_lots()


if __name__ == '__main__':
    update()
