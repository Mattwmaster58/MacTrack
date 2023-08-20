import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ApiEndpoints } from "../common/apiEndpoints";
import { SignInValues } from "../forms/signInForm";

export type UserResponse =
  | {
      success: true;
      username: string;
      admin: boolean;
      message?: string;
    }
  | {
      success: false;
      message: string;
    };

// todo: type this correctly
const useSignInMutation = () => {
  return useMutation<UserResponse, any, any, any>([ApiEndpoints.register], {
    mutationFn: async (signInValues: SignInValues) => {
      const { data } = await axios.post(ApiEndpoints.signIn, signInValues);
      return data;
    },
  });
};

export { useSignInMutation };
