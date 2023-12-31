import { FilterCoreOutputValues } from "../types/filterCoreSchema";
import { useQuery } from "@tanstack/react-query";
import { ApiEndpoints } from "../common/apiEndpoints";
import { FilterData, FilterDataSchema } from "../types/filterSchema";
import axios from "axios";

const useFilterQuery = (filterId: number) => {
  const path = `${ApiEndpoints.filter.list}/${filterId}`;
  return useQuery([ApiEndpoints.filter.list, filterId], {
    queryFn: async (): Promise<FilterData> => {
      const { data } = await axios.get(path);
      return FilterDataSchema.parse(data);
    },
  });
};

export { useFilterQuery };
