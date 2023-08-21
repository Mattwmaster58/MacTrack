import { FilterCoreOutputValues } from "../types/filterCoreSchema";
import { useQuery } from "@tanstack/react-query";
import { ApiEndpoints } from "../common/apiEndpoints";
import { FilterData, FilterDataSchema } from "../types/filterSchema";
import axios from "axios";

const useFiltersQuery = () => {
  return useQuery([ApiEndpoints.filter.list], {
    queryFn: async (): Promise<FilterData[]> => {
      const { data } = await axios.get(ApiEndpoints.filter.list);
      // todo: proper typing for this
      return data.map((f: FilterData) => FilterDataSchema.parse(f));
    },
  });
};

export { useFiltersQuery };
