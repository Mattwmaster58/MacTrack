from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase


# Why AsyncAttrs mixin is required: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#asyncio-orm-avoid-lazyloads
class Base(AsyncAttrs, DeclarativeBase):
    pass
