import functools
import operator
from abc import ABC, abstractmethod
from typing import Literal

from macbidnotify.api.data.models import AuctionLot


class Filter(ABC):
    @abstractmethod
    def __init__(self): ...

    @property
    @abstractmethod
    def as_sqlalchemy_condition(self): ...


AUCTION_LOT_COLUMNS = AuctionLot.__table__.c
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
        column = AUCTION_LOT_COLUMNS.retail_price
        if self.min_ is not None:
            conditions.append(column >= self.min_)
        if self.max_ is not None:
            conditions.append(column <= self.max_)
        return functools.reduce(operator.and_, conditions)


class ConditionFilter(Filter):
    def __init__(self, conditions: list[Condition]):
        self.condition = conditions

    @property
    def as_sqlalchemy_condition(self):
        # todo: don't think it actually works like this
        return self.condition in AUCTION_LOT_COLUMNS


class Fts5Filter(Filter):
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