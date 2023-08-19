from enum import Enum
from typing import Literal

from pydantic import BaseModel


class BooleanFunction(str, Enum):
    AND = "AND"
    OR = "OR"


Conditions = Literal["LIKE NEW", "DAMAGED", "OPEN BOX"]


class SimpleFtsQuery(BaseModel):
    """
    FTS supports a grammar that is much too complex to fully support, at least for my skill level
    This is a much less complex approximation that I suspect will serve the majority of use cases
    """

    boolean_function: BooleanFunction
    columns: list[str]
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


class FilterPayload(FilterCore):
    core: FilterCore
    meta: FilterMeta
