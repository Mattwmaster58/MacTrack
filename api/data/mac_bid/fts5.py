from typing import Type

from sqlalchemy import DDLElement, String, Column, Table
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import InstrumentedAttribute, aliased

from data.base import Base, EXCLUDE_FROM_CREATION_KEY


def get_fts_table_name(base_table: Type[Base]) -> str:
    return f"{base_table.__tablename__}_idx"


def create_fts_idx_alias(original_table: Type[Base], pk_name: str):
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

    idx_table_name = get_fts_table_name(original_table)
    auction_lot_idx = Table(
        idx_table_name,
        original_table.metadata,
        Column("rowid", original_table_pk.type, key=original_table_pk.name, primary_key=True),
        *original_table_columns,
    )
    setattr(auction_lot_idx, EXCLUDE_FROM_CREATION_KEY, True)
    aliased_table = aliased(original_table, auction_lot_idx, adapt_on_names=True, name=idx_table_name)
    return aliased_table


# hugely useful: https://stackoverflow.com/a/49917886/3427299


class CreateFtsIfNoneExistsWithTriggers(DDLElement):
    """
    Represents a CREATE VIRTUAL TABLE ... USING fts5 statement, for creating an
    FTS index on a table, along with the necessary create, update, and delete triggers
    """

    def __init__(self, table, fts_cols: set[Column], version=5):
        self.table = table
        self.version = version
        self.fts_cols = [x.name for x in fts_cols]


@compiles(CreateFtsIfNoneExistsWithTriggers)
def __compiles_fts_table_and_triggers(element: CreateFtsIfNoneExistsWithTriggers, compiler, **_):
    tbl = element.table
    version = element.version
    preparer = compiler.preparer
    sql_compiler = compiler.sql_compiler
    sep = "\n"

    underlying_tbl_name = preparer.format_table(tbl)
    fts_name = preparer.quote(f'{tbl.name}_idx')

    text = f"\nCREATE VIRTUAL TABLE IF NOT EXISTS {fts_name} USING fts{version}("

    # warning: only uses the first stated PK as the content_rowid
    pk_column, *_ = tbl.primary_key
    all_other_columns = [col for col in tbl.columns if col is not pk_column]
    unindexed_prop = " UNINDEXED"
    for column in all_other_columns:
        formatted_col = preparer.format_column(column)
        unindexed = not isinstance(column.type, String) or formatted_col not in element.fts_cols
        text += f"{sep}\t{formatted_col}{unindexed_prop if unindexed else ''}"
        sep = ", \n"

    text += f"{sep}\tcontent={sql_compiler.render_literal_value(tbl.name, String())}"
    text += f"{sep}\tcontent_rowid={sql_compiler.render_literal_value(pk_column.name, String())}"
    text += "\n);\n\n"

    # triggers
    pk_col_name = preparer.format_column(pk_column)
    all_old_columns_with_pk_list = [f"old.{pk_col_name}"]
    all_new_columns_with_pk_list = [f"new.{pk_col_name}"]
    all_non_pk_columns_list = []

    for col in all_other_columns:
        formatted_col = preparer.format_column(col)
        all_old_columns_with_pk_list.append(f'old.{formatted_col}')
        all_new_columns_with_pk_list.append(f'new.{formatted_col}')
        all_non_pk_columns_list.append(formatted_col)

    all_non_pk_columns = ", ".join(all_non_pk_columns_list)
    all_new_columns_with_pk = ", ".join(all_new_columns_with_pk_list)
    all_old_columns_with_pk = ", ".join(all_old_columns_with_pk_list)

    text += f"""
    CREATE TRIGGER IF NOT EXISTS {fts_name}_after_insert
        AFTER INSERT
        ON {underlying_tbl_name}
    BEGIN
        INSERT INTO {fts_name}(rowid, {all_non_pk_columns}) VALUES ({all_new_columns_with_pk});
    END;
    CREATE TRIGGER IF NOT EXISTS {fts_name}_after_delete
        AFTER DELETE
        ON {underlying_tbl_name}
    BEGIN
        INSERT INTO {fts_name}({fts_name}, rowid, {all_non_pk_columns}) VALUES ('delete', {all_old_columns_with_pk});
    END;
    CREATE TRIGGER IF NOT EXISTS {fts_name}_after_update
        AFTER UPDATE
        ON {underlying_tbl_name}
    BEGIN
        INSERT INTO {fts_name}({fts_name}, rowid, {all_non_pk_columns}) VALUES ('delete', {all_old_columns_with_pk});
        INSERT INTO {fts_name}(rowid, {all_non_pk_columns}) VALUES ({all_new_columns_with_pk});
    END;
    """
    return text


create_fts_table_and_triggers = CreateFtsIfNoneExistsWithTriggers
