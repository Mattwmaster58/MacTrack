from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from macbidnotify.api.data.mac_bid.fts5 import create_fts_table_and_triggers
from macbidnotify.api.data.mac_bid import AuctionLot
from macbidnotify.api.data.base_model import Base
# strictly to execute code so those tables get attached to the base and tables get created
# probably won't be necessary if we import this elsewhere
from macbidnotify.api.data.user import User as __

__all__ = ["create_and_connect"]
def create_and_connect(db_path: Path = Path(__file__).parent / "mac.bid.db"):
    engine = create_engine(f"sqlite:///{db_path.as_posix()}")
    Base.metadata.create_all(engine)
    fts_statements = create_fts_table_and_triggers(
        table=AuctionLot.__table__,
        fts_cols={AuctionLot.product_name, AuctionLot.title, AuctionLot.description},
        version=5
    )
    with Session(engine) as s:
        # sqlite doesn't allow multiple statements per execute, so use the underlying connections executescript API
        # noinspection PyUnresolvedReferences
        s.connection().connection.connection.executescript(str(fts_statements))
        print("created FTS mirror")
    return engine