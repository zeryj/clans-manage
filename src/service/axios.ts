import axios, { type AxiosError } from "axios";

const CLASHKING_BASE_URL = (
  process.env.CLASHKING_URL
).replace(/\/+$/, "");

const OFFICIAL_COC_BASE_URL = (
  process.env.COC_URL
).replace(/\/+$/, "");

export const cocClient = axios.create({
  baseURL: OFFICIAL_COC_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  timeout: 30000,
});

cocClient.interceptors.request.use(
  (request) => {
    
    if (request.url?.startsWith("/v2/")) {
      request.baseURL = CLASHKING_BASE_URL;
      delete request.headers.Authorization;
      return request;
    }

    
    request.baseURL = OFFICIAL_COC_BASE_URL;
    const token =
      process.env.API_COC ||
      process.env.API_KEY ||
      process.env.NEXT_PUBLIC_API_KEY;
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => Promise.reject(error),
);

cocClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

export default cocClient;
