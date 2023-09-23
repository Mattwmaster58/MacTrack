from functools import partial

import httpx
import requests

from data.mac_bid import AuctionLot, AuctionGroup, Location, Building
from scraper.utils import filter_list_of_raw_kwargs


def create_prefixed_session(prefix=None):
    if prefix is None:
        prefix = ""
    else:
        prefix = prefix.rstrip("/") + "/"

    def new_request(prefix, f, method, url, *args, **kwargs):
        return f(method, prefix + url, *args, **kwargs)

    s = requests.Session()
    s.request = partial(new_request, prefix, s.request)
    return s


class ApiClient:
    API_BASE = "https://api.macdiscount.com/"

    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=self.API_BASE, transport=httpx.AsyncHTTPTransport(retries=2)
        )

    async def get_auction_lots(self, group_id: int) -> list[dict]:
        resp = (await self.client.get(f"auctions/{group_id}")).json()
        lots = filter_list_of_raw_kwargs(AuctionLot, resp["items"])
        return lots

    async def get_buildings(self):
        return filter_list_of_raw_kwargs(Building, (await self.client.get("/buildings")).json())

    async def get_locations(self):
        return filter_list_of_raw_kwargs(Location, (await self.client.get("/locations")).json())

    async def get_live_auction_groups(self, pg: int, ppg: int) -> list[dict]:
        # see also: https://www.mac.bid/ mac.bid homepage
        return await self._get_auction_groups(
            endpoint="auctionsummary", pg=pg, ppg=ppg, data_key="data"
        )

    async def get_final_auction_groups(self, pg: int, ppg: int) -> list[dict]:
        # see also: https://www.mac.bid/past-auctions
        return await self._get_auction_groups(endpoint="past-auctions", pg=pg, ppg=ppg)

    async def _get_auction_groups(self, endpoint: str, pg: int, ppg: int, data_key: str = None):
        resp = (await self.client.get(endpoint, params={"pg": pg, "ppg": ppg})).json()
        if data_key is not None:
            resp = resp[data_key]
        return filter_list_of_raw_kwargs(AuctionGroup, resp)
