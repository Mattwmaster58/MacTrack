import { FilterCoreOutputValues } from "../types/filterCoreSchema";
import { useQuery } from "@tanstack/react-query";
import { ApiEndpoints } from "../common/apiEndpoints";
import axios from "axios/index";

const useFiltersQuery = () => {
  return useQuery([ApiEndpoints.filter.list], {
    queryFn: async (): Promise<FilterCoreOutputValues[]> => {
      const { data } = await axios.get(ApiEndpoints.filter.list);
      return data;
    },
  });
};

export { useFiltersQuery };
