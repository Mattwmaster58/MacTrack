"""
Module to deserialize frontend filter components to SQLAlchemy clauses.
A lot of this code instruments the creation of SQLite FTS5 queries

Useful documentation:
 - https://www.sqlite.org/fts5.html
 - https://docs.sqlalchemy.org/en/20/core/sqlelement.html#sqlalchemy.sql.expression.bindparam
"""

import functools
import operator
from abc import ABC, abstractmethod
from typing import Literal

from api.data.mac_bid import AuctionLot


class Filter(ABC):
    @abstractmethod
    def __init__(self): ...

    @property
    @abstractmethod
    def as_sqlalchemy_condition(self): ...

Condition = Literal["LIKE NEW", "DAMAGED", "OPEN BOX"]


class RetailPriceFilter(Filter):

    def __init__(self, min_: float, max_: float):
        if not any((min_ is not None, max_ is not None)):
            raise ValueError(f"at least one of min/max needs to be specified for this filter. "
                             f"you specified {min_=} {max_=}")
        self.min_ = min_
        self.max_ = max_

    @property
    def as_sqlalchemy_condition(self):
        conditions = []
        column = AuctionLot.retail_price
        if self.min_ is not None:
            conditions.append(column >= self.min_)
        if self.max_ is not None:
            conditions.append(column <= self.max_)
        return functools.reduce(operator.and_, conditions)


class ConditionFilter(Filter):
    def __init__(self, conditions: list[Condition]):
        self.conditions = conditions

    @property
    def as_sqlalchemy_condition(self):
        # todo: don't think it actually works like this
        return self.conditions in AuctionLot.condition_name

class FtsAllMatchFilter(Filter):
    """Matches rows that contain at least one match per token in any column"""
    def __init__(self, columns: list[str], terms: list[str], exclude: list[str]):
        self.columns = columns
        self.terms = terms
        self.exclude = exclude

    def _to_fts_query(self):
        # todo: use variable binding or smth?
        brace_o, brace_c = "{}"
        query = f'{brace_o} {" ".join(self.columns)} {brace_c} : {" ".join(self.terms)}'
        if self.exclude:
            query += f" NOT ({' OR '.join(self.exclude)})"
        return query

    @property
    def as_sqlalchemy_condition(self):
        return ...


class FtsFilter(Filter):
    def __init__(self, queries: list[str]):
        self.queries = queries

    @property
    def as_sqlalchemy_condition(self):
        return ...

class OrFts5Filter(Filter):
    def __init__(self, terms: list[str]):
        self.terms = terms

    @property
    def as_sqlalchemy_condition(self):
        return ...