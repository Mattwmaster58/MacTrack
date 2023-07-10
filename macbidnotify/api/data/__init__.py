from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from macbidnotify.api.data.mac_bid.fts5 import create_fts_table_and_triggers
from macbidnotify.api.data.mac_bid import AuctionLot
from macbidnotify.api.data.base_model import Base


def create_and_connect(db_path: Path = Path(__file__).parent / "mac.bid.db"):
    engine = create_engine(f"sqlite:///{db_path.as_posix()}")
    Base.metadata.create_all(engine)
    fts_statements = create_fts_table_and_triggers(
        table=AuctionLot.__table__,
        fts_cols={"product_name", "description"},
        version=5
    )
    with Session(engine) as s:
        # noinspection PyUnresolvedReferences
        s.connection().connection.connection.executescript(str(fts_statements))
        print("created FTS mirror")
    return engine
