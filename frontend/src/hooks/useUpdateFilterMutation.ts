import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndpoints } from "../common/apiEndpoints";
import { ApiResponse } from "../types/api";

import { FilterOutputValues } from "../types/filterSchema";

// todo: type this correctly
// todo: invalidate filters list query with an appropriate query key here.
// the current mutation key does not make sense
const useUpdateFilterMutation = (filterId: number) => {
  const path = `${ApiEndpoints.filter.update}/${filterId}`;
  return useMutation<ApiResponse, any, any, any>([path], {
    mutationFn: async (filterValue: FilterOutputValues) => {
      const { data } = await axios.put(path, filterValue);
      return data;
    },
  });
};

export { useUpdateFilterMutation };
