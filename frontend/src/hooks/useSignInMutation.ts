import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { RegisterValues } from "../components/forms/registerForm";
import { SignInValues } from '../components/forms/signInForm'
import { Endpoints } from "./constants";

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

// todo: type this correctly
const useSignInMutation = () => {
  return useMutation<RegisterResponse, any, any, any>(
    [Endpoints.register],
    {
      mutationFn: async (signInValues: SignInValues) => {
        const { data } = await axios.post(
          Endpoints.signIn,
          signInValues
        );
        return data;
      },
    }
  );
};

export { useSignInMutation };
