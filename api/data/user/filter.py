"""
Module to deserialize frontend filter components to SQLAlchemy clauses.
A lot of this code instruments the creation of SQLite FTS5 queries

Useful documentation:
 - https://www.sqlite.org/fts5.html
 - https://docs.sqlalchemy.org/en/20/core/sqlelement.html#sqlalchemy.sql.expression.bindparam
"""

from sqlalchemy import Dialect
from sqlalchemy.types import TypeDecorator, String

from data.http_models.filter import FilterCore


class FilterQueryDbType(TypeDecorator):
    impl = String
    cache_ok = True

    def process_bind_param(self, value: FilterCore, _: Dialect) -> str | None:
        if value is None:
            return None
        if not isinstance(value, FilterCore):
            raise TypeError(f"expected argument of type FilterQuery, got {FilterCore}")
        return value.model_dump_json(exclude_none=True)

    def process_result_value(self, value: str | None, _: Dialect) -> FilterCore | None:
        if value is None:
            return None
        return FilterCore.model_validate_json(value)
