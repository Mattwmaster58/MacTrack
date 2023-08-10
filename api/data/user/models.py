import enum
from datetime import datetime

from sqlalchemy import Enum as SQLAEnum
from sqlalchemy import Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import mapped_column, Mapped

from api.data.base_model import Base
from api.data.mac_bid import AuctionLot


class NotificationStatus(enum.Enum):
    SUCCESS = enum.auto()
    PENDING = enum.auto()
    ABANDONED = enum.auto()
    FAILED = enum.auto()


class User(Base):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)
    approved: Mapped[bool] = mapped_column(Boolean)


class Filter(Base):
    __tablename__ = "filter"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey(User.id))
    payload: Mapped[str] = mapped_column(String)
    active: Mapped[bool] = mapped_column(Boolean, default=False)
    notification_type: Mapped[str] = mapped_column(String)


class Notification(Base):
    __tablename__ = "notification"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    filter_id: Mapped[int] = mapped_column(ForeignKey(Filter.id))
    updated: Mapped[datetime] = mapped_column(DateTime, onupdate=func.now(), server_default=func.now())
    status: Mapped[NotificationStatus] = mapped_column(SQLAEnum(NotificationStatus))


class NotificationItem(Base):
    __tablename__ = "notification_item"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    notification_id: Mapped[int] = mapped_column(ForeignKey(Notification.id))
    lot_id: Mapped[int] = mapped_column(ForeignKey(AuctionLot.id))
