from datetime import datetime

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
