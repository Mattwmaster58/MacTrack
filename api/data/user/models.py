import enum
from datetime import datetime

from sqlalchemy import Enum as SQLAEnum, Dialect
from sqlalchemy import Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.types import TypeDecorator

from data.base import Base
from data.http_models.filter import FilterCore
from data.mac_bid import AuctionLot


class FilterQueryDbType(TypeDecorator):
    impl = String
    cache_ok = True

    def process_bind_param(self, value: FilterCore, _: Dialect) -> str | None:
        if value is None:
            return None
        if not isinstance(value, FilterCore):
            raise TypeError(f"expected argument of type FilterQuery, got {FilterCore}")
        return value.model_dump_json(exclude_none=True)

    def process_result_value(self, value: str | None, _: Dialect) -> FilterCore | None:
        if value is None:
            return None
        return FilterCore.model_validate_json(value)


class NotificationStatus(enum.Enum):
    SUCCESS = enum.auto()
    PENDING = enum.auto()
    ABANDONED = enum.auto()
    FAILED = enum.auto()


class User(Base):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class Filter(Base):
    __tablename__ = "filter"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey(User.id))
    name: Mapped[str] = mapped_column(String, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=False)
    payload: Mapped[FilterCore] = mapped_column(FilterQueryDbType, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Notification(Base):
    __tablename__ = "notification"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    filter_id: Mapped[int] = mapped_column(ForeignKey(Filter.id), nullable=False)
    status: Mapped[NotificationStatus] = mapped_column(
        SQLAEnum(NotificationStatus), default=NotificationStatus.PENDING, nullable=False
    )
    status_text: Mapped[str] = mapped_column(String, nullable=True)
    exceeded_item_limit: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )


class NotificationItem(Base):
    __tablename__ = "notification_item"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    notification_id: Mapped[int] = mapped_column(ForeignKey(Notification.id))
    lot_id: Mapped[int] = mapped_column(ForeignKey(AuctionLot.id))
