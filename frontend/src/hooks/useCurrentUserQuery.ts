import { useQuery } from "@tanstack/react-query";
import { ApiEndpoints } from "../common/apiEndpoints";
import axios from "axios";
import { UserResponse } from "./useSignInMutation";

const path = ApiEndpoints.currentUser;
const useCurrentUserQuery = () => {
  return useQuery([path], {
    queryFn: async (): Promise<UserResponse> => {
      const { data } = await axios.get(path);
      return data;
    },
    enabled: false,
    meta: { ignore401: true },
  });
};

export { useCurrentUserQuery };
