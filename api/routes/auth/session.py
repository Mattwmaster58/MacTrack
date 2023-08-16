from typing import Any, Literal

import bcrypt
from litestar import Request, get, post, Response
from litestar.middleware.session.server_side import (
    ServerSideSessionBackend,
    ServerSideSessionConfig,
)
from litestar.security.session_auth import SessionAuth
from sqlalchemy import select

from data.http_models.session import UserAuthPayload, UserRegisterPayload, UserResponse
from data.user import User
from typings import AsyncDbSession


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


async def retrieve_user_handler(tx: AsyncDbSession, session: dict[str, Any]) -> User | None:
    if user_claimed_id := session.get("user_id"):
        return (await tx.execute(select(User).where(User.id == user_claimed_id))).one_or_none()
    return None


@post("/sign-in")
async def login(request: Request, tx: AsyncDbSession, data: UserAuthPayload) -> Response[UserResponse]:
    user: User | None = (await tx.execute(select(User).where(User.username == data.username))).scalar_one_or_none()
    if user is None:
        resp = Response(UserResponse(success=False, message="That user doesn't exist"), status_code=404)
    elif not check_password(data.password, user.password):
        resp = Response(UserResponse(success=False, message="Incorrect username or password"), status_code=401)
    elif not user.approved:
        resp = Response(UserResponse(success=False, message="Account is pending admin approval"), status_code=402)
    else:
        resp = Response(UserResponse(success=True, username=user.username), status_code=200)
        request.set_session({"user_id": user.id})

    return resp


@post("/register")
async def signup(tx: AsyncDbSession, request: Request, data: UserRegisterPayload) -> Response[UserResponse]:
    any_user = (await tx.execute(select(User.id).limit(1))).scalar_one_or_none()
    existing_user_email = (
        await tx.execute(select(User.email).where((User.username == data.username) | (User.email == data.email)))
    ).scalar_one_or_none()

    if existing_user_email is not None:
        duplicate_field = "email" if existing_user_email == data.email else "username"
        return Response(
            UserResponse(success=False, message=f"This {duplicate_field} has already been used"),
            status_code=400,
        )

    no_users_in_the_table = not any_user

    new_user = User(
        username=data.username, email=data.email, password=hash_password(data.password), approved=no_users_in_the_table
    )
    # todo: validate password?
    tx.add(new_user)
    request.set_session({"user_id": new_user.id})

    return Response(UserResponse(success=True), status_code=201)


@get("/current-user")
async def get_user(request: Request[User, dict[Literal["user_id"], str], Any]) -> UserResponse:
    return UserResponse(success=True, username=request.user.username, admin=request.user.admin)


def create_session_auth(exclude_paths=list[str]):
    return SessionAuth[User, ServerSideSessionBackend](
        retrieve_user_handler=retrieve_user_handler,
        session_backend_config=ServerSideSessionConfig(),
        exclude=exclude_paths,
    )
