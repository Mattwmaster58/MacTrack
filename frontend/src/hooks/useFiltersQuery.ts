import { FilterCoreOutputValues } from "../types/filterCoreSchema";
import { useQuery } from "@tanstack/react-query";
import { ApiEndpoints } from "../common/apiEndpoints";
import { FilterOutputValues } from "../types/filterSchema";
import axios from "axios";

const useFiltersQuery = () => {
  return useQuery([ApiEndpoints.filter.list], {
    queryFn: async (): Promise<FilterOutputValues[]> => {
      const { data } = await axios.get(ApiEndpoints.filter.list);
      return data;
    },
  });
};

export { useFiltersQuery };
