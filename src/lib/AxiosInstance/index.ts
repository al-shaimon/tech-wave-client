import axios from "axios";
import { cookies } from "next/headers";

import envConfig from "@/config/envConfig";

const axiosInstance = axios.create({
  baseURL: envConfig.baseApi,
});

axiosInstance.interceptors.request.use(
  function (config) {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const config = error.config;

    if (error?.response?.status === 401 && !config?.sent) {
      config.sent = true;

      return axiosInstance(config);
    } else {
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;
