from litestar import get, Router, Request, Response, post, put

from data.http_models.common import BaseResponse
from data.http_models.filter import FilterCore, FilterPayload
from data.user import User, Filter
from typings import AsyncDbSession


@get("/list")
async def list_filters(request: Request, tx: AsyncDbSession) -> Response:
    pass


@post("/create")
async def create_filter(request: Request, tx: AsyncDbSession, data: FilterPayload) -> BaseResponse:
    new_filter = Filter(user_id=request.user.id, name=data.meta.name, active=True, payload=data.core)
    tx.add(new_filter)
    return BaseResponse(success=True)


@put("/update/{filter_id:int}")
async def update_filter(request: Request, tx: AsyncDbSession) -> Response:
    pass


router = Router(path="/filters", route_handlers=[list_filters, create_filter, update_filter])
