import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndpoints } from "../common/apiEndpoints";
import { RegisterValues } from "../components/forms/registerForm";
import { ApiResponse } from "../types/api";

// todo: type this correctly
const useRegisterMutation = () => {
  return useMutation<ApiResponse, any, any, any>([ApiEndpoints.register], {
    mutationFn: async (registerValues: RegisterValues) => {
      const { data } = await axios.post(ApiEndpoints.register, registerValues);
      return data;
    },
  });
};

export { useRegisterMutation };
