"""add name field for filter

Revision ID: b8ea9a2053ba
Revises: 7e1bef9a4213
Create Date: 2023-08-19 13:03:59.823522

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b8ea9a2053ba"
down_revision: Union[str, None] = "7e1bef9a4213"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("filter", schema=None) as batch_op:
        batch_op.add_column(sa.Column("name", sa.String(), nullable=False))

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("filter", schema=None) as batch_op:
        batch_op.drop_column("name")

    # ### end Alembic commands ###