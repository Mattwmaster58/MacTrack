import time
from collections import defaultdict

from sqlalchemy import select, join, func, text

from data.mac_bid import AuctionGroup, AuctionLot
from typings import AsyncDbSession

"""
Interesting performance results from al/ag is_open indexes

gg = {
    ("al_asc", "no_ag", "having query"): 1.4394447679987934,
    ("no_al", "no_ag", "having query"): 1.4495296737979515,
    ("al_desc", "no_ag", "having query"): 1.4531069311997271,
    ("al_asc", "no_ag", "exists"): 4.154276611100068,
    ("al_desc", "no_ag", "exists"): 4.207331634199363,
    ("al_asc", "ag_desc", "exists"): 4.264776665602403,
    ("al_asc", "ag", "exists"): 4.291119903798244,
    ("al_asc", "ag_asc", "exists"): 4.305396878900501,
    ("al_desc", "ag_desc", "exists"): 4.333364041199093,
    ("al_desc", "ag", "exists"): 4.3338255648021,
    ("al_desc", "ag_asc", "exists"): 4.355753777800419,
    ("no_al", "no_ag", "exists"): 168.67881660719723,
    ("no_al", "ag", "having query"): 172.6418509457988,
    ("al_asc", "ag", "having query"): 173.90609537179844,
    ("al_asc", "ag_desc", "having query"): 173.91727570980146,
    ("no_al", "ag_asc", "exists"): 174.03243952080228,
    ("al_desc", "ag", "having query"): 174.1254023667978,
    ("al_desc", "ag_asc", "having query"): 174.14119984420103,
    ("al_desc", "ag_desc", "having query"): 174.24391724359884,
    ("no_al", "ag", "exists"): 174.26378093180102,
    ("no_al", "ag_desc", "having query"): 174.31542759099975,
    ("al_asc", "ag_asc", "having query"): 174.51126569239932,
    ("no_al", "ag_asc", "having query"): 174.63533668860038,
    ("no_al", "ag_desc", "exists"): 175.98048507660423,
}
"""


async def benchmark(session: AsyncDbSession):
    # comparing queries with different permutations of indexes
    having_query = (
        select(AuctionGroup.id)
        .select_from(join(AuctionGroup, AuctionLot, AuctionGroup.id == AuctionLot.auction_id))
        .where(AuctionGroup.is_open)
        .group_by(AuctionGroup.id)
        .having(func.count(1).filter(AuctionLot.is_open) == 0)
    )
    exists_query = select(AuctionGroup.id).where(
        AuctionGroup.is_open,
        ~(
            select(1)
            .where(AuctionLot.auction_id == AuctionGroup.id, AuctionLot.is_open)
            .correlate(AuctionGroup)
            .exists()
        ),
    )
    drop_al_index = "DROP INDEX ix_auctionlot_is_open"
    al_indexes = (
        ("CREATE INDEX ix_auctionlot_is_open ON auctionlot (is_open DESC)", "al_desc"),
        ("CREATE INDEX ix_auctionlot_is_open ON auctionlot (is_open ASC)", "al_asc"),
        ("CREATE INDEX ix_auctionlot_is_open ON auctionlot (is_open)", "al_asc"),
        (None, "no_al"),
    )
    drop_ag_index = "DROP INDEX ix_auctiongroup_is_open"
    ag_indexes = (
        ("CREATE INDEX ix_auctiongroup_is_open ON auctiongroup (is_open DESC)", "ag_desc"),
        ("CREATE INDEX ix_auctiongroup_is_open ON auctiongroup (is_open ASC)", "ag_asc"),
        ("CREATE INDEX ix_auctiongroup_is_open ON auctiongroup (is_open)", "ag"),
        (None, "no_ag"),
    )
    results = defaultdict(list)
    for i in range(5):
        for al_idx, al_title in al_indexes:
            if al_idx is not None:
                await session.execute(text(al_idx))
            for ag_idx, ag_title in ag_indexes:
                if ag_idx is not None:
                    await session.execute(text(ag_idx))
                await session.commit()

                for query, title in [(having_query, "having query"), (exists_query, "exists")]:
                    key = (al_title, ag_title, title)
                    print(key, end="")
                    await session.commit()
                    time_taken = await timed_execution(session, query)
                    results[key].append(time_taken)
                    print(f": {time_taken:.2f}")

                if ag_idx is not None:
                    await session.execute(text(drop_ag_index))
                await session.commit()
            if al_idx is not None:
                await session.execute(text(drop_al_index))
            await session.commit()
    print(results)


async def timed_execution(session, query):
    start = time.perf_counter()
    await session.execute(query)
    return time.perf_counter() - start
