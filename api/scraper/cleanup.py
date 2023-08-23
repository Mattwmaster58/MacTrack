import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Type

from sqlalchemy import select, join, func, update

from data import AuctionLot, Base
from data.mac_bid import AuctionGroup
from typings import AsyncDbSession


async def cleanup(session: AsyncDbSession):
    """
    Core parts of the scraping logic depend on AuctionGroup.is_active being accurate, but this is not always the
    case, so we attempt to fix things up here with a few different approaches
        - Add a closed_date to any lots that are CREATED_DATE_TO_CLOSED_DAYS_DELTA_THRESHOLD past the created date
    We use this query to find some stats on the avg deltas to pick CREATED_DATE_TO_CLOSED_DAYS_DELTA_THRESHOLD

    SELECT MIN(delta), MAX(delta), AVG(delta), MEDIAN(delta)
    FROM (SELECT JULIANDAY(a.closed_date) - JULIANDAY(a.date_created) delta
      FROM auctionlot a
      WHERE a.closed_date IS NOT NULL
        AND a.date_created IS NOT NULL
    AND (julianday(date('now')) - julianday(a.date_created)) < 365)

    Current results: min/man/avg/median = -27.63/32.31/3.54/4.13

    Rest of the approaches
        - Close any lots that are past the closed_date
        - Close any groups that have all lots closed - todo: should we do the inverse of this as well?
        - Close any groups that have a date_completed in the past
        - Close any groups that have abandon in the past
    """

    @dataclass
    class CleanupOp:
        table: Type[Base]
        description: str
        and_clauses: list
        static_values: dict[str, any]

    now = datetime.now()
    CREATED_DATE_TO_CLOSED_DAYS_DELTA_THRESHOLD = 14
    CREATED_DATE_TO_CLOSED_DAYS_TIMEDELTA_THRESHOLD = timedelta(days=CREATED_DATE_TO_CLOSED_DAYS_DELTA_THRESHOLD)

    all_cleanup_ops = [
        CleanupOp(
            table=AuctionLot,
            description="adding closed_date to lots whose created_date was long ago",
            and_clauses=[AuctionLot.is_open,
                         AuctionLot.closed_date == None,
                         AuctionLot.date_created != None,
                         AuctionLot.date_created < now - CREATED_DATE_TO_CLOSED_DAYS_TIMEDELTA_THRESHOLD],
            static_values={"closed_date": now}
        ), CleanupOp(
            table=AuctionLot,
            description="closing lots where closed_date is passed",
            and_clauses=[AuctionLot.is_open, now > AuctionLot.closed_date],
            static_values={"is_open": False}
        ), CleanupOp(
            # todo: strange performance on this one with/without index
            table=AuctionGroup,
            description="closing groups where all lots within are closed",
            and_clauses=[AuctionGroup.id == (
                select(AuctionGroup.id)
                .select_from(join(AuctionGroup, AuctionLot, AuctionGroup.id == AuctionLot.auction_id))
                .where(AuctionGroup.is_open)
                .group_by(AuctionGroup.id)
                .having(func.count(1).filter(AuctionLot.is_open) == 0).scalar_subquery()
            )],
            static_values={"is_open": False}
        ), CleanupOp(
            table=AuctionGroup,
            description="closing groups where date completed/abandoned is in the past",
            and_clauses=[AuctionGroup.is_open,
                         (now > AuctionGroup.closing_date) | (now > AuctionGroup.abandon_date)],
            static_values={"is_open": False}
        )]
    for op in all_cleanup_ops:
        start = time.perf_counter()
        update_stmt = update(op.table).where(*op.and_clauses).values(**op.static_values)
        res = await session.execute(update_stmt)
        await session.commit()
        print(f"{op.description} resulted in {res.rowcount} rows effected in {time.perf_counter() - start:.2f}s")
