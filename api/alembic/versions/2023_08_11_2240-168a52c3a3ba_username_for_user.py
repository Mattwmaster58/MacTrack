"""username for user

Revision ID: 168a52c3a3ba
Revises: 0ff295211ebf
Create Date: 2023-08-11 22:40:16.846496

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "168a52c3a3ba"
down_revision: Union[str, None] = "0ff295211ebf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

username = "username"


def upgrade() -> None:
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.add_column(sa.Column(username, sa.String))
        batch_op.create_unique_constraint("uq_username", [username])


def downgrade() -> None:
    op.drop_column("user", username)
