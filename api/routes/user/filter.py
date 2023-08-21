from litestar import get, Router, Request, Response, post, put
from litestar.exceptions import NotFoundException, ClientException
from sqlalchemy import select, update

from data.http_models.common import BaseResponse
from data.http_models.filter import FilterPayload, FilterResponse, FilterMetaResponse
from data.user import Filter
from typings import AsyncDbSession


def filter_response_from_filter_row(row: Filter) -> FilterResponse:
    return FilterResponse(
        core=row.payload,
        meta=FilterMetaResponse(
            name=row.name, active=row.active, updated_at=row.updated_at, created_at=row.created_at, id=row.id
        ),
    )


@get("/list")
async def list_filters(request: Request, tx: AsyncDbSession) -> list[FilterResponse]:
    # todo: PAGINATE THIS
    stmt = select(Filter).where(Filter.user_id == request.user.id).order_by(Filter.updated_at.desc()).limit(10)
    filters = (await tx.execute(stmt)).scalars().all()
    return [filter_response_from_filter_row(f) for f in filters]


@get("/list/{filter_id:int}")
async def list_filter_by_id(request: Request, tx: AsyncDbSession, filter_id: int) -> FilterResponse:
    stmt = select(Filter).where((Filter.user_id == request.user.id) & (Filter.id == filter_id))
    filter = (await tx.execute(stmt)).scalar_one_or_none()
    if filter is None:
        raise NotFoundException
    return filter_response_from_filter_row(filter)


@post("/create")
async def create_filter(request: Request, tx: AsyncDbSession, data: FilterPayload) -> BaseResponse:
    new_filter = Filter(user_id=request.user.id, name=data.meta.name, active=True, payload=data.core)
    tx.add(new_filter)
    return BaseResponse(success=True)


@put("/update/{filter_id:int}")
async def update_filter(request: Request, tx: AsyncDbSession, filter_id: int, data: FilterPayload) -> BaseResponse:
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


router = Router(
    path="/filters", route_handlers=[list_filters, create_filter, update_filter, list_filter_by_id, update_filter]
)
