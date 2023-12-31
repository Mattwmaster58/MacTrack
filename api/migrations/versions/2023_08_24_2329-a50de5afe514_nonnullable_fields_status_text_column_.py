"""nonnullable fields, status_text column for notification

Revision ID: a50de5afe514
Revises: 04ada44d56e5
Create Date: 2023-08-24 23:29:56.158738

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a50de5afe514"
down_revision: Union[str, None] = "04ada44d56e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("notification", schema=None) as batch_op:
        batch_op.add_column(sa.Column("status_text", sa.String(), nullable=True))

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("notification", schema=None) as batch_op:
        batch_op.drop_column("status_text")

    # ### end Alembic commands ###
