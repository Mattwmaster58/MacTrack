import operator
from abc import ABC, abstractmethod

from sqlalchemy import and_, or_, Column
import macbidnotify.data.models as models

Primitive = bool | int | float | str


class Literal:
    def __init__(self, val: Primitive):
        self.val = val

    def serialize(self) -> Primitive:
        return self.val


class ColumnLiteral:
    def __init__(self, val: Column):
        self.val = val

    def serialize(self) -> str:
        return self.val

    @classmethod
    def deserialize(cls, input_str: str) -> 'ColumnLiteral':
        try:
            table, column = input_str.split(".")
            table_des = getattr(models, table)
            column_des = getattr(table_des.__table__.c, column)
        except ValueError as e:
            raise ValueError(f"failed to deserialize: {input_str=} {e}")
        except AttributeError as e:
            raise ValueError(f"failed to deserialize: {input_str=}. \nfailed to find column: {e}")
        return cls(column_des)


class Condition(ABC):
    @abstractmethod
    def __init__(self, /, *args: 'Condition'):
        self.args = args

    def serialize(self) -> dict[str, any]:
        return {self.__class__.__name__: [x.serialize() for x in self.args]}

    def serialize_to_sqla(self): ...

    def deserialize(self, /, input_string: str) -> 'Condition': ...


class Comparison(Condition):
    def __init__(self, column: Column, value: Literal):
        super().__init__(column, value)


class Eq(Comparison):
    pass


class Gt(Comparison):
    pass


class Gte(Comparison):
    pass


class Lt(Comparison):
    pass


class Ne(Comparison):
    pass


class Conjunctive(Condition):
    OPERATOR = NotImplemented

    def __init__(self, /, c1: Condition, c2: Condition):
        super().__init__(c1, c2)


class Or(Conjunctive):
    OPERATOR = operator.or_


class And(Conjunctive):
    OPERATOR = operator.and_
