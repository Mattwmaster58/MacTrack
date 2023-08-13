from litestar import get, Router, Request, Response, post, put

from typings import AsyncDbSession


@get("/list")
async def list_filters(request: Request, tx: AsyncDbSession) -> Response:
    pass


@post("/create")
async def create_filter(request: Request, tx: AsyncDbSession) -> Response:
    pass


@put("/edit/{filter_id:int}")
async def edit_filter(request: Request, tx: AsyncDbSession) -> Response:
    pass


router = Router(path="/filter", route_handlers=[list_filters, create_filter, edit_filter])
