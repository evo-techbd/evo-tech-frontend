import Axios, { AxiosInstance } from "axios";
import { getAuthCookie, removeAuthCookie, setAuthCookie } from "../cookies";

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

const attachApiPrefix = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      const baseUrl = config.baseURL ?? instance.defaults.baseURL ?? "";
      const currentUrl = config.url ?? "";

      // If baseURL already contains /api/v1, strip /api prefix from relative URLs
      if (baseUrl.includes("/api/v1") && currentUrl.startsWith("/api/")) {
        config.url = currentUrl.replace(/^\/api\//, "/");
      } else if (!baseUrl.includes("/api/v1")) {
        config.url = ensureApiV1Path(instance, currentUrl);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Helper to get auth token from cookies
const getAuthToken = async () => {
  if (typeof window === "undefined") return null;

  try {
    return await getAuthCookie();
  } catch {
    return null;
  }
};

// Add auth interceptor for client-side requests
if (typeof window !== "undefined") {
  // Request interceptor: Add access token to requests
  axios.interceptors.request.use(
    async (config) => {
      const token = await getAuthToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle 401 errors and refresh token
  let isRefreshing = false;
  let failedQueue: any[] = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return axios(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Try to refresh the token using cookie-based refresh token
          const response = await Axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          if (response.data?.data?.accessToken) {
            const newAccessToken = response.data.data.accessToken;

            // Store new token in cookie
            await setAuthCookie(newAccessToken);

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            isRefreshing = false;

            // Retry the original request
            return axios(originalRequest);
          } else {
            throw new Error("No access token in refresh response");
          }
        } catch (refreshError: any) {
          processQueue(refreshError, null);
          isRefreshing = false;

          // If refresh fails, clear auth and redirect to login
          if (typeof window !== "undefined") {
            await removeAuthCookie();
            window.location.replace("/login");
          }

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
}

attachApiPrefix(axios);

// For server-side requests (API routes to backend)
// NOTE: Do not set default Content-Type here as it breaks FormData uploads
// Axios will automatically set the correct Content-Type with boundary for FormData
export const axiosPrivate = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

attachApiPrefix(axiosPrivate);

// For client-side authenticated requests, create a helper function
export const createAuthAxios = async () => {
  if (typeof window === "undefined") {
    // Server-side, return the base axios instance
    return axios;
  }

  // Client-side, attach auth token from cookies
  const token = getAuthCookie();

  const authAxios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    withCredentials: true,
  });

  attachApiPrefix(authAxios);
  return authAxios;
};

export default axios;
