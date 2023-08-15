import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndpoints } from "../common/apiEndpoints";
import { SignInValues } from "../components/forms/signInForm";

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

// todo: type this correctly
const useSignInMutation = () => {
  return useMutation<RegisterResponse, any, any, any>([ApiEndpoints.register], {
    mutationFn: async (signInValues: SignInValues) => {
      const { data } = await axios.post(ApiEndpoints.signIn, signInValues);
      return data;
    },
  });
};

export { useSignInMutation };
