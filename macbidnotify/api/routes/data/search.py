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
    boolean_function: BooleanFunction = BooleanFunction.AND,
    include_description: bool = True
) -> str:

    try:
        match_arg = boolean_function.value.upper().join([f'"{term}"' for term in terms])
        stmt = select(AuctionLotIdx).where(AuctionLotIdx.product_name.op("MATCH")(match_arg)).limit(100)
        res = await tx.execute(stmt)
    except Exception:
        raise
    return str(len([*res]))
