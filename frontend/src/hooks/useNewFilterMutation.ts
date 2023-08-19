import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndpoints } from "../common/apiEndpoints";
import { RegisterValues } from "../components/forms/registerForm";
import { ApiResponse } from "../types/api";
import { FilterOutputValues } from "../components/forms/filterForm";

// todo: type this correctly
// todo: invalidate filters list query with an appropriate query key here.
// the current mutation key does not make sense
const useNewFilterMutation = () => {
  return useMutation<ApiResponse, any, any, any>([ApiEndpoints.filter.create], {
    mutationFn: async (filterValue: FilterOutputValues) => {
      const { data } = await axios(ApiEndpoints.filter.create, {
        method: "post",
        data: filterValue,
      });
      return data;
    },
  });
};

export { useNewFilterMutation };
