from contextlib import contextmanager
from datetime import datetime
from itertools import islice
from typing import Type

import pytz
from pytz import timezone
from sqlalchemy import DateTime, bindparam, BindParameter
from sqlalchemy.orm import InstrumentedAttribute

from data.base import Base


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
                # todo: this is still incorrect, we need to make it agnostic of system time
                naive_datetime = max(datetime.strptime(v, "%Y-%m-%dT%H:%M:%S.%fZ"), datetime.utcfromtimestamp(0))
                if normalize_est_to_utc:
                    with_tzinfo = datetime.fromtimestamp(naive_datetime.timestamp(), tz=timezone("US/Eastern"))
                    new_kwargs[key] = with_tzinfo.astimezone(pytz.utc)
                else:
                    new_kwargs[key] = naive_datetime
            except (ValueError, OSError) as e:
                # oserror is possible from datetime error
                raise TypeError(f"Setting {table.__name__}.{key} failed: {type(e)}: {e} with {v=}")
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


def pick_non_pk_columns(
    table: Type[Base], additional_excludes: list[InstrumentedAttribute]
) -> list[InstrumentedAttribute]:
    """
    Returns a list of columns for a table,
    excluding PK columns as well as any excludes specified in additional_excludes
    The additional excludes MUST be InstrumentedAttribute instances, which is the type
    you get when you do eg AuctionGroup.date_scraped
    """
    actual_table = table.__table__
    excluded_cols = {*actual_table.primary_key.columns, *[x.property.columns[0] for x in additional_excludes]}
    output_cols = []
    for col in actual_table.columns:
        if col not in excluded_cols:
            output_cols.append(col)
    return output_cols


def generate_bindparams(cols: list[InstrumentedAttribute]) -> dict[str, BindParameter]:
    return {c.name: bindparam(c.name) for c in cols}


def key_rename_list_in_place(d: list[dict[str, any]], old: str, new: str) -> None:
    for v in d:
        key_rename_in_place(v, old, new)


def key_rename_in_place(d: dict[str, any], old: str, new: str) -> None:
    d[new] = d.pop(old)


@contextmanager
def batched_executor():
    # todo: introspect the SQLITE_LIMIT_VARIABLE_NUMBER
    pass
