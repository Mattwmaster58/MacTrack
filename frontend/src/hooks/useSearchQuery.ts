import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ItemFilterValues } from "../components/forms/itemFilterForm/types/itemFilterValues";
import { AuctionLot } from "../types/AuctionLot";
import { Endpoints } from "./constants";

const useSearchQuery = (itemsFilterValues: ItemFilterValues) => {
  return useQuery([Endpoints.search, itemsFilterValues], {
    queryFn: async () => {
      const { data } = await axios.get<AuctionLot[]>(Endpoints.search, {
        params: itemsFilterValues,
      });
      return data;
    },
  });
};

export { useSearchQuery };
