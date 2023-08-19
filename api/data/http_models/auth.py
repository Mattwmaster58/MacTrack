import re

from pydantic import BaseModel, EmailStr, field_validator

from data.http_models.common import BaseResponse


class UserAuthPayload(BaseModel):
    username: str
    password: str


class UserRegisterPayload(UserAuthPayload):
    email: EmailStr

    @staticmethod
    @field_validator("password")
    def password_meets_bare_minimum(v: str) -> str:
        if not (8 <= len(v) <= 64):
            raise ValueError("password must be at least 8 chars and less than 64")
        return v

    @staticmethod
    @field_validator("username")
    def password_meets_bare_minimum(_, v: str) -> str:
        if re.search(r"\S", v) is None:
            raise ValueError("username must not be empty")
        return v


class UserResponse(BaseResponse):
    username: str | None = None
    admin: bool | None = None
