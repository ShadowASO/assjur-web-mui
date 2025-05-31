import axios from "axios";
import { responseInterceptor } from "./interceptors/ResponseInterceptor";
import { errorInterceptor } from "./interceptors/ErrorInterceptor";

export const BASE_API_URL =
  import.meta.env.VITE_BASE_API_URL || "https://localhost:3333";

const Api = axios.create({
  baseURL: BASE_API_URL,
});

Api.interceptors.response.use(
  (response) => responseInterceptor(response),
  (error) => errorInterceptor(error)
);

export { Api };
