import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndpoints } from "../common/apiEndpoints";
import { ApiResponse } from "../types/api";

import { FilterOutputValues } from "../types/filterSchema";

// todo: type this correctly
// todo: invalidate filters list query with an appropriate query key here.
// the current mutation key does not make sense
const useNewFilterMutation = () => {
  const client = useQueryClient();
  return useMutation<ApiResponse, any, any, any>([ApiEndpoints.filter.create], {
    mutationFn: async (filterValue: FilterOutputValues) => {
      const { data } = await axios(ApiEndpoints.filter.create, {
        method: "post",
        data: filterValue,
      });
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [ApiEndpoints.filter.list] });
    },
  });
};

export { useNewFilterMutation };
