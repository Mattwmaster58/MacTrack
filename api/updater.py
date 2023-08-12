import itertools
from datetime import datetime, timedelta
from itertools import islice
from typing import Iterable

from sqlalchemy import Engine, false, update, select, join, func, case, insert
from sqlalchemy.orm import Session, Query
from tqdm import tqdm

from data.mac_bid import Building, Location, AuctionGroup, AuctionLot
from client import Client
from utils import filter_raw_kwargs_in_place


class MacBidUpdater:
    BULK_INSERT_CHUNK_SIZE = 200

    def __init__(self, db: Engine):
        self.db = db
        self.client = Client()
        self.session = Session(self.db)

    def update_buildings(self):
        resp = self.client.get_buildings()
        with self.session.begin():
            res = self.session.execute(
                insert(Building)
                .values([filter_raw_kwargs_in_place(Building, row) for row in resp])
                .prefix_with("OR IGNORE")
            )
        print(f"inserted <={res.rowcount} new buildings")

    def update_locations(self):
        resp = self.client.get_locations()
        with self.session.begin():
            res = self.session.execute(
                insert(Location)
                .values([filter_raw_kwargs_in_place(Location, row) for row in resp])
                .prefix_with("OR IGNORE")
            )
            # self.session.bulk_save_objects(objs, preserve_order=False)
        print(f"inserted <={res.rowcount} new locations")

    def update_auction_groups(self):
        """
        updates missing auction groups by finding the last auction group we have scraped. we need to be careful we do
        not leave ourselves in a bad state where we insert a very recent auction upon erroring later on, this will
        prevent future updates from correctly finding the data left in between the auction and where the error
        occurred
        """
        last_scraped_group_id = self.session.query(AuctionGroup.id) \
            .where(AuctionGroup.is_open == false()) \
            .order_by(AuctionGroup.closing_date.desc()) \
            .first()

        if last_scraped_group_id is not None:
            last_scraped_group_id = last_scraped_group_id[0]

        self.update_final_auction_groups(last_scraped_group_id)
        self.update_live_auction_groups()

    def update_final_auction_groups(self, last_scraped_group_id):
        ppg = 1000
        pg = 1

        def check_for_auction_group(auction_groups: list, group_id: int):
            if group_id is None:
                return False
            for group in auction_groups:
                if group["id"] == group_id:
                    return True
            return False

        print(f"looking for {last_scraped_group_id=}")
        auction_groups = self.client.get_final_auction_groups(pg, ppg)
        objs = [*auction_groups]  # copy into list
        found_auction = check_for_auction_group(auction_groups, last_scraped_group_id)
        while len(auction_groups) == ppg and not found_auction:
            auction_groups = self.client.get_final_auction_groups(pg, ppg)
            found_auction = check_for_auction_group(auction_groups, last_scraped_group_id)
            print(f"queued {len(objs)}+{len(auction_groups)}={len(objs) + len(auction_groups)} auction groups")
            objs.extend(auction_groups)
            print(f"going back further to find {last_scraped_group_id=} {pg=}")
            pg += 1
        print("inserting past auction groups")
        with self.session.begin_nested():
            # todo: do proper batched insertions here
            # I am not sure if it's possible to both batch and have this specific replacement logic
            # this is definitely fast enough for now
            rows = 0
            for batch in batched([filter_raw_kwargs_in_place(AuctionGroup, row) for row in objs],
                                 n=self.BULK_INSERT_CHUNK_SIZE):
                res = self.session.execute(
                    insert(AuctionGroup)
                    .values(batch)
                    .prefix_with("OR IGNORE")
                )
                rows += res.rowcount
        print(f"inserted <={rows} new auction groups")

    def update_live_auction_groups(self):
        total_groups = 0
        # typically only ~100 live groups at once
        live_groups = self.client.get_live_auction_groups(pg=1, ppg=1000)
        for batch in batched([filter_raw_kwargs_in_place(AuctionGroup, row) for row in live_groups],
                             n=self.BULK_INSERT_CHUNK_SIZE):
            res = self.session.execute(
                insert(AuctionGroup)
                .values(batch)
                .prefix_with("OR IGNORE")
            )
            total_groups += res.rowcount
        self.session.commit()

    def update_final_auction_lots(self):
        print("updating final auction lots")
        # todo: rescrape after close, and verify it
        unscraped_closed_auction_lots = self.session.query(AuctionGroup) \
            .where(AuctionGroup.is_open == false(), AuctionGroup.date_scraped == None) \
            .order_by(AuctionGroup.closing_date.asc())

        self._update_lots_of_groups(unscraped_closed_auction_lots)

    def update_live_auction_lots(self, min_rescrape_seconds: int = None):
        print("updating live auction lots")
        rescrape_condition = false()
        if min_rescrape_seconds is not None:
            delta = timedelta(seconds=min_rescrape_seconds)
            # past + min_rescrape < now == past < now - min_rescrape
            rescrape_condition = AuctionGroup.date_scraped < (datetime.now() - delta)

        open_auction_groups = self.session.query(AuctionGroup).where(
            AuctionGroup.is_open & ((AuctionGroup.date_scraped == None) | rescrape_condition)
        ).order_by(AuctionGroup.closing_date.asc())
        # todo: this isn't updating what i want (date_scraped?)
        self._update_lots_of_groups(open_auction_groups)

    def _update_lots_of_groups(self, groups: Query):
        total_lots = 0
        for group in tqdm(groups, total=groups.count()):
            try:
                lots = self.client.get_auction_lots(group.id)
            except Exception as e:
                print(f"exception occurred: {e}. ignoring for {group=}")
            else:
                if lots:
                    self.session.execute(
                        insert(AuctionLot)
                        .values(lots)
                        .prefix_with("OR REPLACE")
                    )
                group.date_scraped = datetime.now()
                self.session.commit()
                total_lots += len(lots)
        print(f"updated {total_lots} lots")

    def correct_auction_groups(self):
        """
        Core parts of the scraping logic depend on AuctionGroup.is_active being accurate, but this is not always the
        case, so we attempt to fix things up here with a few different approaches
            - First, close any lots that are past the close date
            - Close any groups that have all lots closed
            - Close any groups that have a date_completed in the past
            - Close any groups that have abandon in the past
        """
        now = datetime.now()
        close_lots_where_closed_date_is_passed = update(AuctionLot).where(
            AuctionLot.is_open & (now > AuctionLot.closed_date)
        ).values(is_open=False)

        close_groups_where_all_lots_are_closed = update(AuctionGroup).where(
            AuctionGroup.id == select(AuctionGroup.id).select_from(
                join(AuctionGroup, AuctionLot, AuctionGroup.id == AuctionLot.auction_id)
            ).where(
                AuctionGroup.is_open
            ).group_by(AuctionGroup.id).having(
                func.count(1).filter(AuctionLot.is_open) == 0
            ).scalar_subquery()
        ).values(is_open=False)

        close_groups_if_date_completed_or_abandoned_past = update(AuctionGroup).where(
            AuctionGroup.is_open & ((now > AuctionGroup.closing_date) | (now > AuctionGroup.abandon_date))
        ).values(is_open=False)

        step_explantions = [
            (close_lots_where_closed_date_is_passed, "closing lots where closed_date is passed"),
            (close_groups_where_all_lots_are_closed, "closing groups where all lots within are closed"),
            (close_groups_if_date_completed_or_abandoned_past,
             "closing groups where date completed/abandoned is in the past")
        ]
        for stmt, explanation in step_explantions:
            res = self.session.execute(stmt)
            self.session.commit()
            print(f"{explanation} resulted in {res.rowcount} rows effected")


def batched(iterable, n):
    """
    Batch sequences into seperated iterables of length n
    We use this because we're limited on the amount of values we can insert in a single insert statement,
    and bulk insert operations appear to lack the flexibility to specify conflict resolution (ON CONFLICT REPLACE etc)"""
    if n < 1:
        raise ValueError('n must be at least one')
    it = iter(iterable)
    while batch := tuple(islice(it, n)):
        yield batch
