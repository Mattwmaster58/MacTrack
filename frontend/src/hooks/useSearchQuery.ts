import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndpoints } from "../common/apiEndpoints";
import { FilterCoreOutputValues } from "../types/filterCoreSchema";
import { AuctionLot } from "../types/AuctionLot";

const useSearchQuery = (itemsFilterValues: FilterCoreOutputValues) => {
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
