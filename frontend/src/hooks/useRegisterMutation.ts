import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndpoints } from "../common/apiEndpoints";
import { RegisterValues } from "../components/forms/registerForm";

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

// todo: type this correctly
const useRegisterMutation = () => {
  return useMutation<RegisterResponse, any, any, any>([ApiEndpoints.register], {
    mutationFn: async (registerValues: RegisterValues) => {
      const { data } = await axios.post(ApiEndpoints.register, registerValues);
      return data;
    },
  });
};

export { useRegisterMutation };
