from datetime import datetime
from itertools import islice
from typing import Type

import pytz
from pytz import timezone

from sqlalchemy import DateTime
from data.base_model import Base


def filter_list_of_raw_kwargs(table: Type[Base], vals: list[dict[str, str]], normalize_est_to_utc: bool = True):
    # mac.bid database has times in UTC-5:00 (EST), we would prefer those values are in UTC instead

    return [filter_raw_kwargs(table, x, normalize_est_to_utc) for x in vals]


def filter_raw_kwargs(table: Type[Base], kwargs: dict[str, str], normalize_est_to_utc: bool) -> dict:
    new_kwargs = {}
    table_obj = table.__table__
    col_names = table_obj.columns.keys()
    # noinspection PyTypeChecker
    col_to_type = {col.name: col for col in table_obj.columns}

    for key, v in kwargs.items():
        if key not in col_names:
            continue
        # special datetime handling case
        if isinstance(col_to_type[key].type, DateTime) and v is not None:
            try:
                naive_datetime = datetime.strptime(v, "%Y-%m-%dT%H:%M:%S.%fZ")
                if normalize_est_to_utc:
                    with_tzinfo = datetime.fromtimestamp(naive_datetime.timestamp(), tz=timezone("US/Eastern"))
                    new_kwargs[key] = with_tzinfo.astimezone(pytz.utc)
                else:
                    new_kwargs[key] = naive_datetime
            except ValueError as e:
                raise TypeError(f"{key} on class {table.__name__} failed: {type(e)}: {e}")
        else:
            new_kwargs[key] = v
    return new_kwargs


def batched(iterable, *, n):
    """
    Batch sequences into seperated iterables of length n
    We use this because we're limited on the amount of values we can insert in a single insert statement,
    and bulk insert operations appear to lack the flexibility to specify conflict resolution (ON CONFLICT REPLACE etc)
    """
    if n < 1:
        raise ValueError("n must be at least one")
    it = iter(iterable)
    while batch := tuple(islice(it, n)):
        yield batch
