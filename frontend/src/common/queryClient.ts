import { MutationCache, QueryClient } from "@tanstack/react-query";
import axios from "axios";
import qs from "qs";

axios.defaults.baseURL = "http://localhost:8000";
// array format is chosen because this is what litestar uses
axios.defaults.paramsSerializer = (params) =>
  qs.stringify(params, { arrayFormat: "repeat" });

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    // onError: (error, _variables, _context, mutation) => {
    //   // If this mutation has an onError defined, skip this
    //   if (mutation.options.onError) return;
    //   // any error handling code...
    //   console.error("failed", error);
    // },
  }),
});

export { queryClient };
