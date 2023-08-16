import {
  QueryCache,
  QueryClient,
  QueryClientProvider as BaseQueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
import qs from "qs";
import { AxiosResponse } from "axios/index";

axios.defaults.baseURL = "http://localhost:8000";
// array format is chosen because this is what litestar uses
axios.defaults.paramsSerializer = (params) =>
  qs.stringify(params, { arrayFormat: "repeat" });

type Props = {
  children: React.ReactNode;
};

export type ApiError = {
  response: AxiosResponse<ApiErrorResponseData | string>;
};

export type ApiErrorResponseData = {
  errors: ApiResponseErrors;
};

export type ApiResponseErrors = {
  [field: string]: Array<string>;
};

export const hasStatusCode = (error: unknown, statusCode: number) => {
  const apiError = error as ApiError;
  return apiError?.response?.status === statusCode ?? false;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 10000,
      retry: (failureCount, error) => {
        if (hasStatusCode(error, 404)) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },

  queryCache: new QueryCache({
    onError: (_error, _query) => {
      if (hasStatusCode(_error, 401)) {
        console.log("logging out due to 401:", _error);
        // todo: implement this
        const signOutPath = "/sign-out";
        window.location.href = `${window.location.origin}/${signOutPath}?returnUrl=${window.location.pathname}`;
      } else if (hasStatusCode(_error, 404)) {
        console.log("redirecting due to 404:", _error);
        const rootPathUrl = `${window.location.origin}/`;
        if (window.location.pathname !== "/") {
          window.location.href = rootPathUrl;
        }
      }
    },
  }),
});

const QueryClientProvider = ({ children }: Props) => (
  <BaseQueryClientProvider client={queryClient}>
    {children}
  </BaseQueryClientProvider>
);

export { QueryClientProvider };