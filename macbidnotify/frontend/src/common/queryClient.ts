import {QueryClient} from "@tanstack/react-query";
import axios from "axios";
import qs from "qs";

axios.defaults.baseURL = "http://localhost:8000";
// array format is chosen because this is what litestar uses
axios.defaults.paramsSerializer = params => qs.stringify(params, {arrayFormat: "repeat"});

export const queryClient = new QueryClient();