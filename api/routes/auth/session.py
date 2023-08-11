from typing import Any, Literal

import bcrypt
from litestar import Request, get, post, Response
from litestar.connection import ASGIConnection
from litestar.exceptions import NotAuthorizedException
from litestar.middleware.session.server_side import (
    ServerSideSessionBackend,
    ServerSideSessionConfig,
)
from litestar.security.session_auth import SessionAuth
from litestar.stores.memory import MemoryStore
from pydantic import BaseModel, EmailStr, SecretStr
from sqlalchemy import select

from api.data.user import User
from api.typings import AsyncDbSession


class UserAuthPayload(BaseModel):
    email: str
    password: str


MOCK_DB: dict[str, User] = {}
memory_store = MemoryStore()


# The SessionAuth class requires a handler callable
# that takes the session dictionary, and returns the
# 'User' instance correlating to it.
#
# The session dictionary itself is a value the user decides
# upon. So for example, it might be a simple dictionary
# that holds a user id, for example: { "id": "abcd123" }
#
# Note: The callable can be either sync or async - both will work.
async def retrieve_user_handler(tx: AsyncDbSession, session: dict[str, Any]) -> User | None:
    if user_claimed_id := session.get("user_id"):
        return (await tx.execute(select(User).where(User.id == user_claimed_id))).one_or_none()
    return None


@post("/login")
async def login(request: Request, tx: AsyncDbSession, data: UserAuthPayload) -> User:
    user: User | None = (await tx.execute(select(User).where(User.email == data.email))).one_or_none()
    if user is None or not User.approved:
        breakpoint()

    if bcrypt.checkpw(data.password.get_secret_value().encode("utf-8"), user.password):
        breakpoint()

    if not user.id:
        breakpoint()
        raise NotAuthorizedException

    request.set_session({"user_id": user.id})
    return user


@post("/signup")
async def signup(tx: AsyncDbSession, request: Request, data: UserAuthPayload) -> User:
    new_user = User(name=data.name, email=data.email)
    # todo: validate password?
    tx.add(new_user)
    request.set_session({"user_id": new_user.id})

    return new_user


@get("/current-user")
async def get_user(request: Request[User, dict[Literal["user_id"], str], Any]) -> User:
    # because this route requires authentication, we can access
    # `request.user`, which is the authenticated user returned
    # by the 'retrieve_user_handler' function we passed to SessionAuth.
    return request.user


session_auth = SessionAuth[User, ServerSideSessionBackend](
    retrieve_user_handler=retrieve_user_handler,
    session_backend_config=ServerSideSessionConfig(),
    exclude=["/login", "/signup", "/search"],
)
