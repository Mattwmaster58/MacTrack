from pathlib import Path

from pydantic import BaseModel
from sqlalchemy import *
from sqlalchemy.orm import Session

from data import create_and_connect
from data.user import Filter

db_path = Path("/home/mattm/Documents/projects/mac-track/api/mac.bid.db")
eng = create_and_connect(db_path)
ses = Session(eng)


def create_filter_row_proxy(lid: int):
    """
    Given JSON filter data, constructs and aliased table that can be used in a filter join query. This enables us to
    have one common interface for executing stored filters in the database, as well as real-time search queries
    Args:
        a_id:
    """
    subq = select(literal(0).label("id")).label("auctionlot_idx")
    subq = select().where(literal(0).label("id"))


class FilterJson(BaseModel):
    pass


class FTSQuery(BaseModel):
    pass


def filter_row_to_JSON(row: Filter) -> FilterJson:
    """
    We need to be able to pass this information"""
