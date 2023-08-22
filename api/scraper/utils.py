from datetime import datetime
from itertools import islice

from sqlalchemy import DateTime


def filter_raw_kwargs_in_place(table: type, kwargs):
    table = table.__table__
    column_names = table.columns.keys()
    return {k: v for k, v in kwargs.items() if k in column_names}


def create_from_datetime_json(klass, kwargs):
    convert_str_kwargs_to_datetime_in_place(klass, kwargs)
    return klass(**kwargs)


def convert_str_kwargs_to_datetime_in_place(klass, kwargs):
    col_to_type = {}
    for col in klass.__table__.columns:
        col_to_type[col.name] = col
    for col, v in kwargs.items():
        if isinstance(col_to_type[col].type, DateTime) and v is not None:
            try:
                kwargs[col] = datetime.strptime(v, "%Y-%m-%dT%H:%M:%S.%fZ")
            except ValueError as e:
                raise ValueError(f"{col} on class {klass.__name__} failed: {e}")


def batched(iterable, *, n):
    """
    Batch sequences into seperated iterables of length n
    We use this because we're limited on the amount of values we can insert in a single insert statement,
    and bulk insert operations appear to lack the flexibility to specify conflict resolution (ON CONFLICT REPLACE etc)"""
    if n < 1:
        raise ValueError('n must be at least one')
    it = iter(iterable)
    while batch := tuple(islice(it, n)):
        yield batch
