from litestar import post, Request
from litestar.connection import ASGIConnection
from litestar.exceptions import NotAuthorizedException, NotFoundException
from litestar.handlers import BaseRouteHandler
from sqlalchemy import select

from data.user import Filter
from scraper.notification import run_filter
from typings import AsyncDbSession


def admin_user_guard(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    if not connection.user.admin:
        raise NotAuthorizedException()


@post("/filter/manual_trigger/{filter_id:int}", guards=[admin_user_guard])
async def manual_filter_trigger(request: Request, tx: AsyncDbSession, filter_id: int):
    filter = (
        await tx.execute(select(Filter).where(Filter.id == filter_id, Filter.user_id == request.user.id))
    ).one_or_none()
    if filter is None:
        raise NotFoundException
    await run_filter(filter)
