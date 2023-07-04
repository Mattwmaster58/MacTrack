from pathlib import Path

import click

from data import create_and_connect
from mac_bid_client import MacBidClient


@click.command()
@click.option("--db-path", default=Path(__file__).parent / "mac.bid.db", type=click.Path())
def update(db_path: Path):
    db_path = Path(db_path).absolute()
    engine = create_and_connect(db_path)
    mbc = MacBidClient(engine)
    mbc.update_locations()
    mbc.update_buildings()
    mbc.update_auction_groups()
    mbc.update_auction_lots()


if __name__ == '__main__':
    update()
