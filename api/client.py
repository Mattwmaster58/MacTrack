from functools import partial

import requests

from macbidnotify.api.data.mac_bid import AuctionLot, AuctionGroup
from utils import convert_str_kwargs_to_datetime_in_place, filter_raw_kwargs_in_place


def create_prefixed_session(prefix=None):
    if prefix is None:
        prefix = ""
    else:
        prefix = prefix.rstrip('/') + '/'

    def new_request(prefix, f, method, url, *args, **kwargs):
        return f(method, prefix + url, *args, **kwargs)

    s = requests.Session()
    s.request = partial(new_request, prefix, s.request)
    return s


class Client:
    API_BASE = "https://api.macdiscount.com/"

    def __init__(self):
        self.client = create_prefixed_session(self.API_BASE)

    def get_auction_lots(self, group_id: int) -> list[dict]:
        resp = self.client.get(f"auctions/{group_id}").json()
        lots = []
        for lot in resp["items"]:
            convert_str_kwargs_to_datetime_in_place(AuctionLot, lot)
            lots.append(lot)
        return lots

    def get_buildings(self):
        return self.client.get("buildings").json()

    def get_locations(self):
        return self.client.get("locations").json()

    def get_live_auction_groups(self, pg: int, ppg: int) -> list[AuctionGroup]:
        # see also: https://www.mac.bid/ mac.bid homepage
        return self._get_auction_groups(endpoint="auctionsummary", pg=pg, ppg=ppg, data_key="data")

    def get_final_auction_groups(self, pg: int, ppg: int) -> list[AuctionGroup]:
        # see also: https://www.mac.bid/past-auctions
        return self._get_auction_groups(endpoint="past-auctions", pg=pg, ppg=ppg)

    def _get_auction_groups(self, endpoint: str, pg: int, ppg: int, data_key: str = None):
        groups = []
        resp = self.client.get(endpoint, params={"pg": pg, "ppg": ppg}).json()
        if data_key is not None:
            resp = resp[data_key]
        for group in resp:
            group = filter_raw_kwargs_in_place(AuctionGroup, group)
            convert_str_kwargs_to_datetime_in_place(AuctionGroup, group)
            groups.append(group)
        return groups
