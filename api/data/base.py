from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase

# this is necessary because we need to create a proxy table to make handling the FTS table nice,
# and want the proxy table to be in the same metadata collection as all the other - but do NOT want
# SA creating this table for us - it's a special table we generate SQL to create this vtable ourselves
# so we can set this flag on a table object to exclude it
EXCLUDE_FROM_CREATION_KEY = "_skip_create"


# Why AsyncAttrs mixin is required: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#asyncio-orm-avoid-lazyloads
class Base(AsyncAttrs, DeclarativeBase):
    pass
