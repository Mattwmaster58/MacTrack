from datetime import datetime

from sqlalchemy import (
    String,
    Boolean,
    Integer,
    ForeignKey,
    DateTime,
    Float,
    Table,
    Column,
)
from sqlalchemy.orm import Mapped, mapped_column, aliased

from macbidnotify.api.data.base_model import Base


# class TransferPair(Base):
#     __tablename__ = "transfer_pair"
#     source: Mapped[int] = mapped_column(ForeignKey(Location.id), primary_key=True)
#     destination: Mapped[int] = mapped_column(ForeignKey(Location.id), primary_key=True)


class Building(Base):
    __tablename__ = "building"
    id: Mapped[int] = mapped_column(Integer(), primary_key=True)
    name: Mapped[str] = mapped_column(String(), nullable=True)
    address: Mapped[str] = mapped_column(String(), nullable=True)
    maps_place_id: Mapped[str] = mapped_column(String(), nullable=True)
    city_state: Mapped[str] = mapped_column(String(), nullable=True)
    zip_code: Mapped[str] = mapped_column(String(), nullable=True)
    notes: Mapped[str] = mapped_column(String(), nullable=True)
    can_transfer: Mapped[bool] = mapped_column(Boolean(), nullable=True)
    hours: Mapped[str] = mapped_column(String(), nullable=True)
    code: Mapped[str] = mapped_column(String(), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    region_id: Mapped[int] = mapped_column(Integer, nullable=True)
    transfer_destinations: Mapped[str] = mapped_column(String, nullable=True)

    def __repr__(self) -> str:
        return f"<Building {self.name!r}@{self.id!r}>"


class Location(Base):
    __tablename__ = "location"
    id: Mapped[int] = mapped_column(Integer(), primary_key=True)
    name: Mapped[str] = mapped_column(String(), nullable=True)
    address: Mapped[str] = mapped_column(String(), nullable=True)
    city_state: Mapped[str] = mapped_column(String(), nullable=True)
    zip_code: Mapped[str] = mapped_column(String(), nullable=True)
    can_transfer: Mapped[int] = mapped_column(Boolean(), nullable=True)
    color: Mapped[str] = mapped_column(String(), nullable=True)
    notes: Mapped[str] = mapped_column(String(), nullable=True)
    hours: Mapped[str] = mapped_column(String(), nullable=True)
    code: Mapped[str] = mapped_column(String(), nullable=True)
    building_id: Mapped[int] = mapped_column(ForeignKey(Building.id))
    region_id: Mapped[int] = mapped_column(Integer(), nullable=True)
    transfer_destinations: Mapped[str] = mapped_column(String, nullable=True)

    def __repr__(self) -> str:
        return f"<Location {self.name!r}@{self.building_id!r}/{self.id!r}>"


class AuctionGroup(Base):
    __tablename__ = "auctiongroup"
    date_scraped: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date_created: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    auction_number: Mapped[str] = mapped_column(String, nullable=True)
    external_folder_name: Mapped[str] = mapped_column(String, nullable=True)
    pickup_date: Mapped[str] = mapped_column(String, nullable=True)
    closed_for_entry: Mapped[bool] = mapped_column(Boolean, nullable=True)
    closing_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    location_id: Mapped[int] = mapped_column(ForeignKey(Location.id), nullable=True)
    allow_transfers: Mapped[bool] = mapped_column(Boolean, nullable=True)
    abandon_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    auction_mobility_id: Mapped[str] = mapped_column(String, nullable=True)
    auction_type_id: Mapped[int] = mapped_column(Integer, nullable=True)
    removal_text: Mapped[str] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=True)
    free_transfers: Mapped[bool] = mapped_column(Boolean, nullable=True)
    date_launched: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    date_completed: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    is_open: Mapped[bool] = mapped_column(Boolean, nullable=True)
    stagger_close_seconds: Mapped[int] = mapped_column(Integer, nullable=True)
    extension_window_seconds: Mapped[int] = mapped_column(Integer, nullable=True)
    time_extension_seconds: Mapped[int] = mapped_column(Integer, nullable=True)
    total_lots: Mapped[int] = mapped_column(Integer, nullable=True)
    online_only: Mapped[bool] = mapped_column(Boolean, nullable=True)
    members_only: Mapped[bool] = mapped_column(Boolean, nullable=True)
    new_billing: Mapped[bool] = mapped_column(Boolean, nullable=True)
    label_size: Mapped[int] = mapped_column(Integer, nullable=True)
    title: Mapped[str] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    logo: Mapped[str] = mapped_column(String, nullable=True)
    date_reviewed: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    lot_fee_override: Mapped[float] = mapped_column(Float, nullable=True)
    buyers_premium_override: Mapped[float] = mapped_column(Float, nullable=True)
    immediate_settle: Mapped[bool] = mapped_column(Boolean, nullable=True)
    custom_invoice_email: Mapped[str] = mapped_column(String, nullable=True)
    non_taxable: Mapped[bool] = mapped_column(Boolean, nullable=True)
    summary_email: Mapped[str] = mapped_column(String, nullable=True)
    info_message: Mapped[str] = mapped_column(String, nullable=True)
    registration_message: Mapped[str] = mapped_column(String, nullable=True)
    pickup_override: Mapped[str] = mapped_column(String, nullable=True)
    location_name: Mapped[str] = mapped_column(String, nullable=True)
    building_id: Mapped[int] = mapped_column(ForeignKey(Building.id), nullable=True)


class AuctionLot(Base):
    __tablename__ = "auctionlot"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    auction_id: Mapped[int] = mapped_column(
        ForeignKey(AuctionGroup.id), primary_key=True
    )
    closed_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    expected_close_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    inventory_id: Mapped[int] = mapped_column(Integer, nullable=True)
    date_created: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    lot_number: Mapped[int] = mapped_column(Integer, nullable=True)
    listing_url: Mapped[str] = mapped_column(String, nullable=True)
    title: Mapped[str] = mapped_column(String, nullable=True)
    is_open: Mapped[bool] = mapped_column(Boolean, nullable=True)
    is_transferrable: Mapped[bool] = mapped_column(Boolean, nullable=True)
    total_bids: Mapped[int] = mapped_column(Integer, nullable=True)
    winning_customer_id: Mapped[int] = mapped_column(Integer, nullable=True)
    winning_bid_id: Mapped[str] = mapped_column(String, nullable=True)
    winning_bid_amount: Mapped[int] = mapped_column(Integer, nullable=True)
    unique_bidders: Mapped[int] = mapped_column(Integer, nullable=True)
    product_name: Mapped[str] = mapped_column(String, nullable=True)
    upc: Mapped[str] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=True)
    is_pallet: Mapped[bool] = mapped_column(Boolean, nullable=True)
    is_shippable: Mapped[bool] = mapped_column(Boolean, nullable=True)
    current_location_id: Mapped[int] = mapped_column(Integer, nullable=True)
    shipping_height: Mapped[int] = mapped_column(Integer, nullable=True)
    shipping_width: Mapped[int] = mapped_column(Integer, nullable=True)
    shipping_length: Mapped[int] = mapped_column(Integer, nullable=True)
    warehouse_location: Mapped[str] = mapped_column(String, nullable=True)
    shipping_weight: Mapped[int] = mapped_column(Integer, nullable=True)
    case_packed_qty: Mapped[int] = mapped_column(Integer, nullable=True)
    retail_price: Mapped[float] = mapped_column(Float, nullable=True)
    condition_name: Mapped[str] = mapped_column(String, nullable=True)
    category: Mapped[str] = mapped_column(String, nullable=True)
    image_url: Mapped[str] = mapped_column(String, nullable=True)


auction_lot_idx = Table(
    "auctionlot_idx",
    Base.metadata,
    Column("rowid", Integer(), key="id", primary_key=True),
    Column("auction_id", String),
    Column("product_name", String),
)

AuctionLotIdx = aliased(
    AuctionLot,
    auction_lot_idx,
    adapt_on_names=True
)
