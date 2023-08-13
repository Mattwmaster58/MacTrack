import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndpoints } from '../common/apiEndpoints'
import { ItemFilterValues } from "../components/forms/itemFilterForm/types/itemFilterValues";
import { AuctionLot } from "../types/AuctionLot";

const useSearchQuery = (itemsFilterValues: ItemFilterValues) => {
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
