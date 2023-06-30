import sqlite3
from functools import partial

import requests
from sqlalchemy import Engine
from sqlalchemy.dialects.sqlite import Insert
from sqlalchemy.orm import Session
from tqdm import tqdm

from utils import filter_raw_kwargs, convert_str_kwargs_to_datetime_in_place
from macbidnotify.data.models import *


def _prefix_insert_with_replace(insert, compiler, **kw):
    return compiler.visit_insert(insert.prefix_with('OR IGNORE'), **kw)


def create_prefixed_session(prefix=None):
    if prefix is None:
        prefix = ""
    else:
        prefix = prefix.rstrip('/') + '/'

    def new_request(prefix, f, method, url, *args, **kwargs):
        return f(method, prefix + url, *args, **kwargs)

    s = requests.Session()
    s.request = partial(new_request, prefix, s.request)
    return s


class MacBidClient:
    API_BASE = "https://api.macdiscount.com/"

    def __init__(self, db: Engine):
        self.client = create_prefixed_session(self.API_BASE)
        self.db = db
        self.session = Session(self.db)

    def get_auction_lots(self, group_id: int) -> list[dict]:
        resp = self.client.get(f"auctions/{group_id}").json()
        lots = []
        for lot in resp["items"]:
            convert_str_kwargs_to_datetime_in_place(AuctionLot, lot)
            lots.append(lot)
        return lots

    def update_buildings(self):
        resp = self.client.get("buildings").json()
        with self.session.begin():
            res = self.session.execute(
                Building.__table__
                .insert()
                .values([filter_raw_kwargs(Building.__table__, row) for row in resp])
                .prefix_with("OR IGNORE")
            )
            # self.session.bulk_save_objects(objs, preserve_order=False)
        print(f"inserted <={res.rowcount} new buildings")

    def update_locations(self):

        resp = self.client.get("locations").json()
        with self.session.begin():
            res = self.session.execute(
                Location.__table__
                .insert()
                .values([filter_raw_kwargs(Location.__table__, row) for row in resp])
                .prefix_with("OR IGNORE")
            )
            # self.session.bulk_save_objects(objs, preserve_order=False)
        print(f"inserted <={res.rowcount} new locations")

    def get_auction_groups(self, pg: int, ppg: int = 2500) -> list[AuctionGroup]:
        groups = []
        resp = self.client.get("past-auctions", params={"pg": pg, "ppg": ppg}).json()
        for group in resp:
            convert_str_kwargs_to_datetime_in_place(AuctionGroup, group)
            groups.append(group)
        return groups

    def update_auction_groups(self):
        """
        updates missing auction groups by finding the last auction group we have scraped. we need to be careful we do
        not leave ourselves in a bad state where we insert a very recent auction upon erroring later on, this will
        prevent future updates from correctly finding the data left in between the auction and where the error
        occurred
        """
        last_scraped_group_id = self.session.query(AuctionGroup.id) \
            .order_by(AuctionGroup.id.desc()) \
            .first()

        if last_scraped_group_id is not None:
            last_scraped_group_id = last_scraped_group_id[0]

        self.update_definitive_auction_groups(last_scraped_group_id)
        self.update_provisional_auction_groups(last_scraped_group_id)

    def update_definitive_auction_groups(self, last_scraped_group_id):
        ppg = 100
        pg = 1

        def check_for_auction_group(auction_groups: list, group_id: int):
            if group_id is None:
                return False
            for group in auction_groups:
                if group["id"] == group_id:
                    return True
            return False

        print(f"looking for {last_scraped_group_id=}")
        auction_groups = self.get_auction_groups(pg, ppg)
        objs = [*auction_groups]  # copy into list
        found_auction = check_for_auction_group(auction_groups, last_scraped_group_id)
        while len(auction_groups) == ppg and not found_auction:
            auction_groups = self.get_auction_groups(pg, ppg)
            found_auction = check_for_auction_group(auction_groups, last_scraped_group_id)
            print(f"queued +{len(auction_groups)} auction groups")
            objs.extend(auction_groups)
            print(f"going back further to find {last_scraped_group_id=} {pg=}")
            pg += 1
        with self.session.begin_nested():
            res = self.session.execute(
                AuctionGroup.__table__
                .insert()
                .values([filter_raw_kwargs(AuctionGroup.__table__, row) for row in objs])
                .prefix_with("OR IGNORE")
            )
        print(f"inserted <={res.rowcount} new auction groups")

    def update_auction_lots(self):
        unscraped_auction_groups = self.session.query(AuctionGroup) \
            .filter(AuctionGroup.date_scraped == None) \
            .order_by(AuctionGroup.id.asc())

        total_lots = 0
        for group in tqdm(unscraped_auction_groups, total=unscraped_auction_groups.count()):
            try:
                lots = self.get_auction_lots(group.id)
            except Exception as e:
                print(f"exception occurred: {e}. ignoring for {group=}")
            else:
                if lots:
                    self.session.execute(
                        AuctionLot.__table__
                        .insert()
                        .values(lots)
                        .prefix_with("OR REPLACE")
                    )
                group.date_scraped = datetime.now()
                self.session.commit()
                total_lots += len(lots)
        print(f"updated {total_lots} lots")

    def update_provisional_auction_groups(self, last_scraped_group_id: int):
        resp = self.client.get("auctionsummary")


mbc = MacBidClient(engine)
mbc.update_locations()
mbc.update_buildings()
mbc.update_auction_groups()
mbc.update_auction_lots()
