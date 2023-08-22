import asyncio
import time
from datetime import datetime, timedelta

from sqlalchemy import false, update, select, join, func, insert, Select
from tqdm import tqdm

from data.mac_bid import Building, Location, AuctionGroup, AuctionLot
from scraper.api_client_async import ApiClient
from scraper.utils import filter_raw_kwargs_in_place, batched
from typings import AsyncDbSession


class MacBidUpdater:
    BULK_INSERT_CHUNK_SIZE = 200

    def __init__(self, session: AsyncDbSession):
        self.session = session
        self.client = ApiClient()

    async def update_buildings(self):
        resp = await self.client.get_buildings()
        res = await self.session.execute(
            insert(Building)
            .values([filter_raw_kwargs_in_place(Building, row) for row in resp])
            .prefix_with("OR IGNORE")
        )
        print(f"inserted <={res.rowcount} new buildings")

    async def update_locations(self):
        resp = await self.client.get_locations()
        res = await self.session.execute(
            insert(Location)
            .values([filter_raw_kwargs_in_place(Location, row) for row in resp])
            .prefix_with("OR IGNORE")
        )
        print(f"inserted <={res.rowcount} new locations")

    async def update_auction_groups(self):
        """
        updates missing auction groups by finding the last auction group we have scraped. we need to be careful we do
        not leave ourselves in a bad state where we insert a very recent auction upon erroring later on, this will
        prevent future updates from correctly finding the data left in between the auction and where the error
        occurred
        """
        stmt = select(AuctionGroup.id).where(AuctionGroup.is_open == false()) \
            .order_by(AuctionGroup.closing_date.desc()) \
            .limit(1)

        last_scraped_group_id = (await self.session.execute(stmt)).scalar_one_or_none()
        await self.update_final_auction_groups(last_scraped_group_id)
        await self.update_live_auction_groups()

    async def update_final_auction_groups(self, last_scraped_group_id):
        ppg = 1000
        pg = 1

        def check_for_auction_group(auction_groups_: list, group_id: int):
            if group_id is None:
                return False
            for group in auction_groups_:
                if group["id"] == group_id:
                    return True
            return False

        print(f"looking for {last_scraped_group_id=}")
        auction_groups = await self.client.get_final_auction_groups(pg, ppg)
        objs = [*auction_groups]  # copy into list
        found_auction = check_for_auction_group(auction_groups, last_scraped_group_id)
        while len(auction_groups) == ppg and not found_auction:
            auction_groups = await self.client.get_final_auction_groups(pg, ppg)
            found_auction = check_for_auction_group(auction_groups, last_scraped_group_id)
            print(f"queued {len(objs)}+{len(auction_groups)}={len(objs) + len(auction_groups)} auction groups")
            objs.extend(auction_groups)
            print(f"going back further to find {last_scraped_group_id=} {pg=}")
            pg += 1
        print("inserting past auction groups")
        # todo: do proper batched insertions here
        # I am not sure if it's possible to both batch and have this specific replacement logic
        # this is definitely fast enough for now
        rows = 0
        for batch in batched([filter_raw_kwargs_in_place(AuctionGroup, row) for row in objs],
                             n=self.BULK_INSERT_CHUNK_SIZE):
            res = await self.session.execute(
                insert(AuctionGroup)
                .values(batch)
                .prefix_with("OR IGNORE")
            )
            rows += res.rowcount
        print(f"inserted <={rows} new auction groups")

    async def update_live_auction_groups(self):
        total_groups = 0
        # typically only ~100 live groups at once
        live_groups = await self.client.get_live_auction_groups(pg=1, ppg=1000)
        transformed_live_groups = [filter_raw_kwargs_in_place(AuctionGroup, row) for row in live_groups]
        for batch in batched(transformed_live_groups, n=self.BULK_INSERT_CHUNK_SIZE):
            res = await self.session.execute(
                insert(AuctionGroup)
                .values(batch)
                .prefix_with("OR IGNORE")
            )
            total_groups += res.rowcount
        await self.session.commit()

    async def update_final_auction_lots(self) -> None:
        print("updating final auction lots")
        # todo: rescrape after close, and verify it
        return await self._update_lots_of_groups(
            select(AuctionGroup)
            .where(AuctionGroup.is_open == false(), AuctionGroup.date_scraped == None)
            .order_by(AuctionGroup.closing_date.asc())
        )

    async def update_live_auction_lots(self, min_rescrape_seconds: int = None) -> None:
        print("updating live auction lots")
        rescrape_condition = false()
        if min_rescrape_seconds is not None:
            delta = timedelta(seconds=min_rescrape_seconds)
            # because we can't easily do math on the date_scraped column, it's simpler to rearrange:
            # [now > (past + min_rescrape)] is equivalent to [past < now - min_rescrape]
            rescrape_condition = AuctionGroup.date_scraped < (datetime.now() - delta)

        # todo: this isn't updating what i want (date_scraped?)
        # todo: is the above statement even true? i don't hink it is anymore but i haven't checked recently
        await self._update_lots_of_groups(
            select(AuctionGroup)
            .where(AuctionGroup.is_open & ((AuctionGroup.date_scraped == None) | rescrape_condition))
            .order_by(AuctionGroup.closing_date.asc())
        )

    async def _update_lots_of_groups(self, query: Select["tuple[AuctionGroup]"]) -> None:
        total_lots = 0
        groups_res = await self.session.execute(query)
        # noinspection PyTypeChecker
        groups_count = await self.session.execute(select(func.count()).select_from(query))
        for group in tqdm(groups_res, total=groups_count.scalar()):
            try:
                lots = await self.client.get_auction_lots(group.id)
            except Exception as e:
                print(f"exception occurred: {e}. ignoring for {group=}")
            else:
                for batch in batched(lots, n=self.BULK_INSERT_CHUNK_SIZE):
                    await self.session.execute(
                        insert(AuctionLot)
                        .values(batch)
                        .prefix_with("OR REPLACE")
                    )
                group.date_scraped = datetime.now()
                await self.session.commit()
                total_lots += len(lots)
        print(f"updated {total_lots} lots")

    async def correct_auction_groups(self):
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
            start = time.perf_counter()
            res = await self.session.execute(stmt)
            await self.session.commit()
            print(f"{explanation} resulted in {res.rowcount} rows effected in {time.perf_counter() - start:.2f}s")
