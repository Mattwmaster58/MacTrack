import { FilterCoreOutputValues } from "../types/filterCoreSchema";
import { useQuery } from "@tanstack/react-query";
import { ApiEndpoints } from "../common/apiEndpoints";
import axios, { AxiosPromise } from "axios/index";

const useFiltersQuery = () => {
  return useQuery<FilterCoreOutputValues[], any, any, any>(
    [ApiEndpoints.filters],
    {
      queryFn: async () => {
        const { data } = await axios.get<FilterCoreOutputValues[]>(
          ApiEndpoints.filters,
        );
        return data;
      },
    },
  );
};

export { useFiltersQuery };
