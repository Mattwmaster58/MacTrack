import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndpoints } from "../common/apiEndpoints";
import { FilterCoreOutputValues } from "../types/filterCoreSchema";
import { AuctionLot, AuctionLotSchema } from "../types/AuctionLot";

const useSearchQuery = (itemsFilterValues: FilterCoreOutputValues) => {
  return useQuery([ApiEndpoints.search, itemsFilterValues], {
    queryFn: async () => {
      const { data } = await axios.post<AuctionLot[]>(ApiEndpoints.search, {
        ...itemsFilterValues.core,
      });
      return data.map((al) => AuctionLotSchema.parse(al));
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
};

export { useSearchQuery };
