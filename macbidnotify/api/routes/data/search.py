from typing import Optional

from litestar import Litestar, Router, get
from sqlalchemy import Engine, select
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

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
) -> str:
    try:
        match_arg = boolean_function.value.upper().join([f'"{term}"' for term in terms])
        where_clauses = [AuctionLotIdx.product_name.op("MATCH")(match_arg)]
        if min_price is not None:
            where_clauses.append(AuctionLotIdx.retail_price >= min_price)
        if max_price is not None:
            where_clauses.append(AuctionLotIdx.retail_price <= max_price)

        stmt = select(AuctionLotIdx).where(*where_clauses).limit(100)
        res = await tx.execute(stmt)
    except Exception:
        raise
    return str(len([*res]))
