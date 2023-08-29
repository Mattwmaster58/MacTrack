import { FilterCoreOutputValues } from "../types/filterCoreSchema";
import { useQuery } from "@tanstack/react-query";
import { ApiEndpoints } from "../common/apiEndpoints";
import { FilterDataSchema } from "../types/filterSchema";
import axios from "axios";
import { GetPaginatedResponseSchema } from "../types/api";
import { z } from "zod";

export const FiltersPaginatedResponseSchema =
  GetPaginatedResponseSchema(FilterDataSchema);
export type FiltersPaginationResponse = z.infer<
  typeof FiltersPaginatedResponseSchema
>;

const useFiltersQuery = (limit: number, offset: number) => {
  return useQuery([ApiEndpoints.filter.list, limit, offset], {
    queryFn: async (): Promise<FiltersPaginationResponse> => {
      const { data } = await axios.get(ApiEndpoints.filter.list);
      // todo: proper typing for this
      return FiltersPaginatedResponseSchema.parse(data);
    },
  });
};

export { useFiltersQuery };
