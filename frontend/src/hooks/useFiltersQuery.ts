import { FilterCoreOutputValues } from "../types/filterCoreSchema";
import { useQuery } from "@tanstack/react-query";
import { ApiEndpoints } from "../common/apiEndpoints";
import axios from "axios/index";

const useFiltersQuery = () => {
  return useQuery([ApiEndpoints.filters], {
    queryFn: async (): Promise<FilterCoreOutputValues[]> => {
      const { data } = await axios.get(ApiEndpoints.filters);
      return data;
    },
  });
};

export { useFiltersQuery };
