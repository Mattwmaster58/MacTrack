"""
Should match the type definitions in @frontend/src/components/forms/itemFilterForm/types/itemfilterValues.tsx
currently maintained by hand :/
"""
from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel

Conditions = Literal["LIKE NEW", "DAMAGED", "OPEN BOX"]


class BooleanFunction(Enum):
    AND = "and"
    OR = "or"


class SimpleFtsQuery(BaseModel):
    """
    FTS supports a grammar that is much too complex to fully support, at least for my skill level
    This is a much less complex approximation that I suspect will serve the majority of use cases
    """

    boolean_function: BooleanFunction
    include_description: bool
    includes: list[str]
    excludes: list[str] = []

    def serialize_match(self) -> str:
        pass


class FilterCore(BaseModel):
    fts_query: SimpleFtsQuery
    min_retail_price: float = -1
    max_retail_price: float = -1
    damaged: bool
    new_: bool
    open_box: bool


class FilterMeta(BaseModel):
    name: str
    active: bool


class FilterMetaResponse(FilterMeta):
    updated_at: datetime
    created_at: datetime
    id: int


class FilterPayload(BaseModel):
    core: FilterCore
    meta: FilterMeta


class FilterResponse(FilterPayload):
    meta: FilterMetaResponse
