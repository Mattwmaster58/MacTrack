import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ItemFilterValues } from "../components/forms/itemFilter/types/itemFilterValues";
import { AuctionLot } from "../types/AuctionLot";

const path = "/search";
const useSearchQuery = (itemsFilterValues: ItemFilterValues) => {
  return useQuery([path, itemsFilterValues], {
    queryFn: async () => {
      const { data } = await axios.get<AuctionLot[]>(path, {
        params: itemsFilterValues,
      });
      return data;
    },
  });
};

export { useSearchQuery };
