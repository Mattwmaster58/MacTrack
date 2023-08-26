import asyncio
from datetime import datetime, timedelta
from typing import Iterable

from sqlalchemy import false, select, func, insert, Select, update, bindparam, text
from tqdm import tqdm

from data.mac_bid import Building, Location, AuctionGroup, AuctionLot
from scraper.api_client import ApiClient
from scraper.utils import batched, pick_non_pk_columns, generate_bindparams, key_rename_list_in_place
from typings import AsyncDbSession


class MacBidUpdater:
    BULK_INSERT_CHUNK_SIZE = 200
    CONCURRENT_LOT_SCRAPE_LIMIT = 2

    def __init__(self, session: AsyncDbSession):
        self.session = session
        self.client = ApiClient()

    async def sync_db(self):
        """
        Syncs database with mac.bid API, ensuring the correct order of operations is used as well
        """
        await self.update_locations()
        await self.update_buildings()
        # todo: sanity checks: how many lots were open before/after scrape
        await self.update_live_auction_groups()
        await self.update_live_auction_lots()
        await self.update_final_auction_groups()
        await self.update_final_auction_lots()

    async def update_buildings(self) -> None:
        buildings = await self.client.get_buildings()
        res = await self.session.execute(insert(Building).values(buildings).prefix_with("OR IGNORE"))
        print(f"inserted <={res.rowcount} new buildings")

    async def update_locations(self) -> None:
        locations = await self.client.get_locations()
        res = await self.session.execute(insert(Location).values(locations).prefix_with("OR IGNORE"))
        print(f"inserted <={res.rowcount} new locations")

    async def update_final_auction_groups(self) -> None:
        """
        updates missing auction groups by finding the last auction group we have scraped. we need to be careful we do
        not leave ourselves in a bad state where we insert a very recent auction upon erroring later on, this will
        prevent future updates from correctly finding the data left in between the auction and where the error
        occurred
        """
        ppg = 1000
        pg = 1

        stmt = (
            select(AuctionGroup.id)
            .where(AuctionGroup.is_open == false())
            .order_by(AuctionGroup.closing_date.desc())
            .limit(1)
        )

        last_scraped_group_id = (await self.session.execute(stmt)).scalar_one_or_none()

        def check_for_auction_group(auction_groups_: list, group_id: int):
            if group_id is None:
                return False
            return group_id in map(lambda x: x["id"], auction_groups_)

        print(f"looking for {last_scraped_group_id=}")
        cur_page_groups = await self.client.get_final_auction_groups(pg, ppg)
        all_groups = [*cur_page_groups]  # copy into list
        found_auction = check_for_auction_group(cur_page_groups, last_scraped_group_id)
        if (
            not found_auction
            and last_scraped_group_id is not None
            and (max_group_id := max(map(lambda x: x["id"], cur_page_groups))) < last_scraped_group_id
        ):
            raise ValueError(
                f"{last_scraped_group_id=} is greater than the max "
                f"of the first auction summary page {max_group_id=}"
            )

        while len(cur_page_groups) == ppg and not found_auction:
            cur_page_groups = await self.client.get_final_auction_groups(pg, ppg)
            found_auction = check_for_auction_group(cur_page_groups, last_scraped_group_id)
            print(
                f"queued {len(all_groups)}+{len(cur_page_groups)}={len(all_groups) + len(cur_page_groups)} auction groups"
            )
            all_groups.extend(cur_page_groups)
            print(f"going back further to find {last_scraped_group_id=} {pg=}")
            pg += 1
        print(f"inserting past auction groups {found_auction=}")
        inserted_rows = updated_rows = 0
        for batch in batched(all_groups, n=self.BULK_INSERT_CHUNK_SIZE):
            inserted_rows += (
                await self.session.execute(insert(AuctionGroup).values(batch).prefix_with("OR IGNORE"))
            ).rowcount
            # todo: verify this behaviour is correct
            # here, we do an update https://stackoverflow.com/a/20310838/3427299
            # todo: find a better abstraction, this one is pretty bad
            r = (await self.session.execute(text("PRAGMA SQLITE_LIMIT_VARIABLE_NUMBER"))).scalar_one_or_none()
            cols_to_update = pick_non_pk_columns(AuctionGroup, [AuctionGroup.date_scraped])
            update_bindparams = generate_bindparams(cols_to_update)
            new_id_bindparam = "b_id"
            follow_up_update_stmt = update(AuctionGroup).where(AuctionGroup.id == bindparam("b_id"))
            key_rename_list_in_place(batch, "id", new_id_bindparam)
            updated_rows += (await self.session.execute(follow_up_update_stmt, batch)).rowcount

        print(f"inserted <={inserted_rows}/updated <={updated_rows} new auction groups")

    async def update_live_auction_groups(self) -> None:
        print("updating live auction groups")
        total_groups = 0
        # typically only ~100 live groups at once
        live_groups = await self.client.get_live_auction_groups(pg=1, ppg=1000)
        for batch in batched(live_groups, n=self.BULK_INSERT_CHUNK_SIZE):
            res = await self.session.execute(insert(AuctionGroup).values(batch).prefix_with("OR IGNORE"))
            # no need to do update here, we don't care too much about updated groups for live auctions
            # the correct data will eventually show up in the final group
            total_groups += res.rowcount
        print(f"inserted <= {total_groups} live auction groups")
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
        pbar = tqdm(total=groups_count.scalar())
        tasks = set()
        task_to_group = {}
        for group in groups_res.scalars():
            if len(tasks) >= self.CONCURRENT_LOT_SCRAPE_LIMIT:
                # wait until at least one task completes before adding a new one
                # note the reassigning of the tasks variable here
                finished_tasks, tasks = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
                total_lots += await self._unwrap_lot_tasks(finished_tasks, task_to_group)
                # todo: progress bar update here
            # since we're lazy loading here, we need to ensure asyncio happens in async context
            # that's what awaitable_attrs is for. no idea what exactly that means but that's what SQLA told me
            group_id = await group.awaitable_attrs.id
            additional_task = asyncio.create_task(self.client.get_auction_lots(group_id))
            task_to_group[additional_task] = group
            tasks.add(additional_task)

        if len(tasks) > 0:
            # processing remaining tasks
            # (there will be no pending tasks, _ are pending)
            finished_tasks, __pending = await asyncio.wait(tasks)
            total_lots += await self._unwrap_lot_tasks(finished_tasks, task_to_group)
        # todo: progress bar update here
        print(f"updated {total_lots} lots")

    async def _unwrap_lot_tasks(self, tasks: Iterable[asyncio.Future], task_to_group_mapping: dict) -> int:
        total_lots_inserted = 0
        for t in tasks:
            group = task_to_group_mapping[t]
            if t.done():
                try:
                    lots = t.result()
                    await self._insert_lots(group, lots)
                    total_lots_inserted += len(lots)
                except Exception as e:
                    print(f"exception occurred: {type(e)}: {e}. {group} failed")
            else:
                raise ValueError("You should only be passing done futures to this internal function :(")
        await self.session.commit()
        return total_lots_inserted

    async def _insert_lots(self, group, lots) -> None:
        for batch in batched(lots, n=self.BULK_INSERT_CHUNK_SIZE):
            await self.session.execute(insert(AuctionLot).values(batch).prefix_with("OR REPLACE"))
        # todo: hopefully this isn't problematic
        group.date_scraped = datetime.utcnow()
