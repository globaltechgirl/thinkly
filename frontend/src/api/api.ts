import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
} from "axios";
import { API_BASE_URL } from "@/utils/constants";

/**
 * =====================================================
 * STORAGE KEYS
 * =====================================================
 */
const TOKEN_KEY = "token";
const USER_KEY = "user";

/**
 * =====================================================
 * SAFE STORAGE (SSR SAFE)
 * =====================================================
 */
const storage = {
  get: (key: string): string | null => {
    if (typeof window === "undefined") return null;

    try {
      const value = window.localStorage.getItem(key);
      if (!value || value === "undefined" || value === "null") return null;
      return value;
    } catch (err) {
      console.warn("[Storage GET ERROR]", err);
      return null;
    }
  },

  set: (key: string, value: string): void => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      console.warn("[Storage SET ERROR]", err);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn("[Storage REMOVE ERROR]", err);
    }
  },
};

/**
 * =====================================================
 * AUTH HELPERS
 * =====================================================
 */
export const getToken = () => storage.get(TOKEN_KEY);
export const setToken = (token: string) => storage.set(TOKEN_KEY, token);

/**
 * =====================================================
 * GUEST HELPERS (NO GENERATION HERE)
 * =====================================================
 */
export const clearAuth = () => {
  storage.remove(TOKEN_KEY);
  storage.remove(USER_KEY);
};

/**
 * =====================================================
 * AXIOS INSTANCE
 * =====================================================
 */
const API: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: new AxiosHeaders({
    Accept: "application/json",
    "Content-Type": "application/json",
  }),
});

/**
 * =====================================================
 * REQUEST INTERCEPTOR
 * =====================================================
 */
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    /**
     * =====================================
     * AUTH USER
     * =====================================
     */
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/**
 * =====================================================
 * RESPONSE INTERCEPTOR (SYNC GUEST ID)
 * =====================================================
 */
API.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error?.response?.status;
    const data = error?.response?.data as any;

    /**
     * =====================================
     * AUTH EXPIRED
     * =====================================
     */
    if (status === 401) {
      clearAuth();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:logout"));
      }
    }

    /**
     * =====================================
     * NETWORK ERROR
     * =====================================
     */
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your internet connection.",
        status: 0,
      });
    }

    /**
     * =====================================
     * NORMALIZED ERROR
     * =====================================
     */
    return Promise.reject({
      message: data?.message || data?.error || "Request failed",
      status,
      data,
    });
  },
);

/**
 * =====================================================
 * PUBLIC API (NO AUTH)
 * =====================================================
 */
export const PUBLIC_API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: new AxiosHeaders({
    Accept: "application/json",
    "Content-Type": "application/json",
  }),
});

/**
 * =====================================================
 * TYPE SAFE WRAPPER
 * =====================================================
 */
export const apiRequest = {
  get: async <T>(url: string, config = {}): Promise<T> => {
    const res = await API.get<T>(url, config);
    return res.data;
  },

  post: async <T>(url: string, data?: any, config = {}): Promise<T> => {
    const res = await API.post<T>(url, data, config);
    return res.data;
  },

  put: async <T>(url: string, data?: any, config = {}): Promise<T> => {
    const res = await API.put<T>(url, data, config);
    return res.data;
  },

  patch: async <T>(url: string, data?: any, config = {}): Promise<T> => {
    const res = await API.patch<T>(url, data, config);
    return res.data;
  },

  delete: async <T>(url: string, config = {}): Promise<T> => {
    const res = await API.delete<T>(url, config);
    return res.data;
  },
};

export default API;
