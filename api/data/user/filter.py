"""
Should match the type definitions in @frontend/src/components/forms/itemFilterForm/types/itemfilterValues.tsx
currently maintained by hand :/

Module to deserialize frontend filter components to SQLAlchemy clauses.
A lot of this code instruments the creation of SQLite FTS5 queries

Useful documentation:
 - https://www.sqlite.org/fts5.html
 - https://docs.sqlalchemy.org/en/20/core/sqlelement.html#sqlalchemy.sql.expression.bindparam
"""
from enum import Enum
from typing import Literal

from pydantic import BaseModel
from sqlalchemy import Dialect
from sqlalchemy.types import TypeDecorator, String


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


class FilterQuery(BaseModel):
    fts_query: SimpleFtsQuery
    min_retail_price: float = -1
    max_retail_price: float = -1
    damaged: bool
    new_: bool
    open_box: bool


class FilterQueryDbType(TypeDecorator):
    impl = String
    cache_ok = True

    def process_bind_param(self, value: FilterQuery, _: Dialect) -> str | None:
        if value is None:
            return None
        if not isinstance(value, FilterQuery):
            raise TypeError(f"expected argument of type FilterQuery, got {FilterQuery}")
        return value.model_dump_json(exclude_none=True)

    def process_result_value(self, value: str | None, _: Dialect) -> FilterQuery | None:
        if value is None:
            return None
        return FilterQuery.model_validate_json(value)
