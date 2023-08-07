from typing import Optional

from litestar import get
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from data import AuctionLot
from data.mac_bid import AuctionLotIdx
from routes.data.typings import BooleanFunction


@get("/search")
async def search(
    tx: AsyncSession,
    terms: list[str],
    exclude: Optional[list[str]],
    min_price: Optional[float],
    max_price: Optional[float],
    boolean_function: BooleanFunction = BooleanFunction.AND,
    include_description: bool = True,
) -> list[AuctionLot]:
    where_clauses = []
    match_arg = boolean_function.value.upper().join([f'"{term}"' for term in terms])
    match_arg = f"({match_arg})"
    if exclude_arg := boolean_function.OR.value.upper().join([f'"{term}"' for term in exclude]):
        match_arg += f" NOT ({exclude_arg})"

    where_clauses.append(AuctionLotIdx.product_name.op("MATCH")(match_arg))
    if min_price is not None:
        where_clauses.append(AuctionLotIdx.retail_price >= min_price)
    if max_price is not None:
        where_clauses.append(AuctionLotIdx.retail_price <= max_price)
    try:
        stmt = select(AuctionLotIdx).where(*where_clauses).limit(100)
        res = await tx.execute(stmt)
    except Exception:
        raise
    # todo: select 0th element more automatically?
    rows = [x[0] for x in res]
    return rows

