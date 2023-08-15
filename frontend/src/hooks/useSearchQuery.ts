import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndpoints } from '../common/apiEndpoints'
import { ItemFilterOutputValues } from "../components/forms/itemFilterForm/itemFilterSchema";
import { AuctionLot } from "../types/AuctionLot";

const useSearchQuery = (itemsFilterValues: ItemFilterOutputValues) => {
  return useQuery([ApiEndpoints.search, itemsFilterValues], {
    queryFn: async () => {
      const { data } = await axios.get<AuctionLot[]>(ApiEndpoints.search, {
        params: itemsFilterValues,
      });
      return data;
    },
  });
};

export { useSearchQuery };
