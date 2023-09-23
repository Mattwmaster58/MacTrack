from contextlib import asynccontextmanager
from typing import AsyncGenerator

from litestar.contrib.sqlalchemy.plugins import SQLAlchemyAsyncConfig
from litestar.datastructures import State
from litestar.exceptions import ClientException
from litestar.status_codes import HTTP_409_CONFLICT
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import async_sessionmaker

from typings import AsyncDbSession

session_maker = async_sessionmaker(expire_on_commit=False)


async def provide_transaction(state: State) -> AsyncGenerator[AsyncDbSession, None]:
    db_engine_key = SQLAlchemyAsyncConfig.engine_app_state_key

    async with session_maker(bind=state[db_engine_key]) as session:
        try:
            async with session.begin():
                yield session
        except IntegrityError as exc:
            raise ClientException(
                status_code=HTTP_409_CONFLICT,
                detail=str(exc),
            ) from exc


provide_transaction_ctx = asynccontextmanager(provide_transaction)
