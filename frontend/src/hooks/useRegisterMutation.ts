import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { RegisterValues } from "../components/forms/registerForm";
import { Endpoints } from "./constants";

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

// todo: type this correctly
const useRegisterMutation = () => {
  return useMutation<RegisterResponse, any, any, any>(
    [Endpoints.register],
    {
      mutationFn: async (registerValues: RegisterValues) => {
        const { data } = await axios.post(
          Endpoints.register,
          registerValues
        );
        return data;
      },
    }
  );
};

export { useRegisterMutation };
