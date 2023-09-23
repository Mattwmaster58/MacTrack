import functools
import operator
from typing import cast

from litestar import post
from sqlalchemy import select, column, Select
from sqlalchemy.ext.asyncio import AsyncSession

from data.http_models.filter import FilterCore, BooleanFunction
from data.mac_bid import AuctionLotIdx, AuctionLot
from data.mac_bid.fts5 import get_fts_table_name
from data.mac_bid.models import LotCondition


def query_statement_from_filter_core(filter_core: FilterCore) -> Select:
    # todo: everything is slower when querying on fts vtable - we should probably do a join with FTS here
    where_clauses = query_clauses_from_filter_core(filter_core)
    stmt = select(AuctionLotIdx).where(*where_clauses)
    return stmt


def query_clauses_from_filter_core(filter_core):
    fts_data = filter_core.fts_query
    if len(fts_data.includes) == 0:
        raise ValueError("cannot form a query with no FTS include terms")
    if not any((filter_core.new_, filter_core.open_box, filter_core.damaged)):
        raise ValueError("must include at least one acceptable condition")
    where_clauses = []
    # fts clause
    fts_serialized = ""
    if not fts_data.include_description:
        fts_serialized += f"-{AuctionLot.description.name}:"
    includes_serialized = fts_data.boolean_function.value.join([f'"{term}"' for term in fts_data.includes])
    fts_serialized += f"({includes_serialized})"
    if excludes_serialized := BooleanFunction.OR.value.upper().join([f'"{term}"' for term in fts_data.excludes]):
        fts_serialized += f" NOT ({excludes_serialized})"
    where_clauses.append(fts_match_op(AuctionLot)(fts_serialized))

    # price clauses
    if filter_core.min_retail_price > -1:
        where_clauses.append(AuctionLotIdx.retail_price >= filter_core.min_retail_price)
    if filter_core.max_retail_price > -1:
        where_clauses.append(AuctionLotIdx.retail_price <= filter_core.max_retail_price)
    # item condition clauses
    desired_item_conditions = []
    if filter_core.new_:
        desired_item_conditions.append(AuctionLotIdx.condition_name == LotCondition.new_)
    if filter_core.open_box:
        desired_item_conditions.append(AuctionLotIdx.condition_name == LotCondition.open_box)
    if filter_core.damaged:
        desired_item_conditions.append(AuctionLotIdx.condition_name == LotCondition.damaged)
    where_clauses.append(functools.reduce(operator.or_, desired_item_conditions))
    return where_clauses


def fts_match_op(original_table):
    return column(get_fts_table_name(original_table)).op("MATCH")


async def items_from_filter_core(tx: AsyncSession, data: FilterCore) -> list[AuctionLot]:
    stmt = query_statement_from_filter_core(data)
    try:
        rows = await tx.execute(
            stmt.limit(100).order_by(
                AuctionLotIdx.is_open.desc(), AuctionLotIdx.closed_date.desc(), AuctionLotIdx.expected_close_date.desc()
            )
        )
    except Exception:
        raise
    scalar_rows = rows.scalars().all()
    return cast("list[AuctionLot]", scalar_rows)


@post("/search")
async def search(
        tx: AsyncSession,
        data: FilterCore,
) -> list[AuctionLot]:
    # todo: PAGINATE THIS
    items = await items_from_filter_core(tx, data)
    return items
