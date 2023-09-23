from typing import TypeVar, Generic

from pydantic import BaseModel


class BaseResponse(BaseModel):
    success: bool
    message: str = None


T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    limit: int
    offset: int
    data: list[T]
