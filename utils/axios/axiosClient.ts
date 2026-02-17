"use client";

import { getAuthCookie } from "@/utils/cookies";
import Axios, { AxiosInstance } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";

const ensureApiV1Path = (instance: AxiosInstance, url?: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const normalized = url.startsWith("/") ? url : `/${url}`;

  const baseUrl = instance.defaults.baseURL ?? "";
  const baseHasApiPrefix =
    typeof baseUrl === "string" && baseUrl.includes("/api/v1");

  if (normalized.startsWith("/api/v1")) {
    return normalized;
  }

  if (normalized.startsWith("/api/")) {
    if (baseHasApiPrefix) {
      return normalized.replace(/^\/api\//, "/");
    }

    return normalized.replace(/^\/api\//, "/api/v1/");
  }

  if (baseHasApiPrefix) {
    return normalized;
  }

  return `/api/v1${normalized}`;
};

// Client-side axios instance with cookie-based token
const createAxiosClient = async () => {
  const token = getAuthCookie();

  // Create a new axios instance to avoid modifying the global one
  const axiosClient = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 120000, // 120 seconds timeout for file uploads
  });

  axiosClient.interceptors.request.use(
    (config) => {
      // Only transform URL if baseURL doesn't already contain /api/v1
      const baseUrl = config.baseURL ?? axiosClient.defaults.baseURL ?? "";
      const currentUrl = config.url ?? "";

      // If baseURL already contains /api/v1, strip /api prefix from relative URLs
      if (baseUrl.includes("/api/v1") && currentUrl.startsWith("/api/")) {
        config.url = currentUrl.replace(/^\/api\//, "/");
      } else if (!baseUrl.includes("/api/v1")) {
        config.url = ensureApiV1Path(axiosClient, currentUrl);
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  axiosClient.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => {
      axiosErrorLogger({ error });
      return Promise.reject(error);
    }
  );

  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return axiosClient;
};

export default createAxiosClient;
