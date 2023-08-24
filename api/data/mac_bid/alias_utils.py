from typing import Type

from sqlalchemy import Table, Column
from sqlalchemy.orm import aliased, DeclarativeBase, InstrumentedAttribute


def create_ftx_idx_alias(original_table: Type[DeclarativeBase], pk_name: str):
    original_table_columns = []
    original_table_pk: Column | None = None

    for attr in dir(original_table):
        attr_val = getattr(original_table, attr)
        if not attr.startswith("__") and isinstance(attr_val, InstrumentedAttribute):
            col = attr_val.property.columns[0]
            if col.primary_key and col.name == pk_name:
                original_table_pk = col
            else:
                original_table_columns.append(Column(col.name, col.type, nullable=col.nullable))

    idx_table_name = f"{original_table.__tablename__}_idx"
    auction_lot_idx = Table(
        idx_table_name,
        original_table.metadata,
        Column("rowid", original_table_pk.type, key=original_table_pk.name, primary_key=True),
        *original_table_columns,
    )
    aliased_table = aliased(original_table, auction_lot_idx, adapt_on_names=True, name=idx_table_name)
    aliased_table.__tablename__ = idx_table_name
    return aliased_table
