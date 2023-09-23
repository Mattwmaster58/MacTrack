from typing import cast

from litestar import get, Router, Request, post, put
from litestar.di import Provide
from litestar.exceptions import NotFoundException, ClientException
from litestar.pagination import AbstractAsyncOffsetPaginator
from sqlalchemy import select, update, func

from data.http_models.common import BaseResponse, PaginatedResponse
from data.http_models.filter import FilterPayload, FilterResponse, FilterMetaResponse
from data.user import Filter
from typings import AsyncDbSession


class FilterListPaginator(AbstractAsyncOffsetPaginator[Filter]):
    def __init__(self, tx: AsyncDbSession, request: Request) -> None:
        self.tx = tx
        self.user = request.user

    async def get_total(self) -> int:
        stmt = select(func.count(Filter.id)).where(Filter.user_id == self.user.id)
        return cast("int", await self.tx.scalar(stmt))

    async def get_items(self, limit: int, offset: int) -> list[FilterResponse]:
        stmt = (
            select(Filter).where(Filter.user_id == self.user.id).order_by(Filter.updated_at.desc())
        )
        filters = await self.tx.scalars(stmt.slice(offset, limit))
        return list(map(filter_response_from_filter_row, filters.all()))


def filter_response_from_filter_row(row: Filter) -> FilterResponse:
    return FilterResponse(
        core=row.payload,
        meta=FilterMetaResponse(
            name=row.name,
            active=row.active,
            updated_at=row.updated_at,
            created_at=row.created_at,
            id=row.id,
        ),
    )


@get("/list")
async def list_filters(
    f_list_paginator: FilterListPaginator, limit: int = 10, offset: int = 0
) -> PaginatedResponse[FilterResponse]:
    return PaginatedResponse(
        total=await f_list_paginator.get_total(),
        limit=limit,
        offset=offset,
        data=await f_list_paginator.get_items(limit, offset),
    )


@get("/list/{filter_id:int}")
async def list_filter_by_id(request: Request, tx: AsyncDbSession, filter_id: int) -> FilterResponse:
    stmt = select(Filter).where(Filter.user_id == request.user.id, Filter.id == filter_id)
    filter_row = (await tx.execute(stmt)).scalar_one_or_none()
    if filter_row is None:
        raise NotFoundException
    return filter_response_from_filter_row(filter_row)


@post("/create")
async def create_filter(request: Request, tx: AsyncDbSession, data: FilterPayload) -> BaseResponse:
    new_filter = Filter(
        user_id=request.user.id, name=data.meta.name, active=True, payload=data.core
    )
    tx.add(new_filter)
    return BaseResponse(success=True)


@put("/update/{filter_id:int}")
async def update_filter(
    request: Request, tx: AsyncDbSession, filter_id: int, data: FilterPayload
) -> BaseResponse:
    stmt = (
        update(Filter)
        .where((Filter.user_id == request.user.id) & (Filter.id == filter_id))
        .values(
            name=data.meta.name,
            active=data.meta.active,
            payload=data.core,
        )
    )
    n_rows_affected = (await tx.execute(stmt)).rowcount
    if n_rows_affected == 0:
        raise ClientException("No rows matched for update statement when one was expected")
    return BaseResponse(success=True)


@get("/history/{filter_id:int}")
async def get_filter_history(request: Request, tx: AsyncDbSession, filter_id: int) -> BaseResponse:
    pass


router = Router(
    dependencies={"f_list_paginator": Provide(FilterListPaginator, sync_to_thread=False)},
    path="/filters",
    route_handlers=[list_filters, create_filter, update_filter, list_filter_by_id, update_filter],
)
