import API from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { notifyErrorOnce, notifySuccess } from "@/api/notify";
import {
  LoginValues,
  LoginResponse,
  RegisterValues,
  RegisterResponse,
} from "@/types/auth";

/**
 * =====================================================
 * STORAGE KEYS
 * =====================================================
 */
const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};

/**
 * =====================================================
 * SAFE STORAGE (SSR SAFE)
 * =====================================================
 */
const storage = {
  get(key: string) {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },
  set(key: string, value: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  remove(key: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};

/**
 * =====================================================
 * AUTH HEADERS (NO GLOBAL MUTATION)
 * =====================================================
 */
const setAuthHeader = (token: string | null) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

/**
 * =====================================================
 * STATE HELPERS
 * =====================================================
 */
const setToken = (token: string | null) => {
  if (!token) return;

  storage.set(STORAGE_KEYS.TOKEN, token);
  setAuthHeader(token);
};

const setUser = (user: any | null) => {
  if (!user) return;

  storage.set(STORAGE_KEYS.USER, JSON.stringify(user));
};

/**
 * =====================================================
 * RESET AUTH STATE (CRITICAL FIX)
 * =====================================================
 */
const reset = () => {
  storage.remove(STORAGE_KEYS.TOKEN);
  storage.remove(STORAGE_KEYS.USER);

  setAuthHeader(null);
};

/**
 * =====================================================
 * ERROR HANDLER
 * =====================================================
 */
const fail = (err: any): never => {
  notifyErrorOnce(err);
  throw err;
};

/**
 * =====================================================
 * AUTH STATE SYNC
 * =====================================================
 */
const syncAuth = (token: string, user: any) => {
  setToken(token);
  setUser(user);

  window.dispatchEvent(new Event("auth-change"));
};

const syncGuest = (user: any, token?: string | null) => {
  if (token) {
    setToken(token);
  }

  setUser(user);

  window.dispatchEvent(new Event("auth-change"));
};

/**
 * =====================================================
 * AUTH SERVICE (PRODUCTION READY)
 * =====================================================
 */
const authService = {
  /**
   * REGISTER
   */
  async register(data: RegisterValues): Promise<RegisterResponse> {
    try {
      const res = await API.post(ENDPOINTS.AUTH.REGISTER, data);

      const { token, user } = res.data;

      syncAuth(token, user);

      return res.data;
    } catch (err) {
      return fail(err);
    }
  },

  /**
   * LOGIN
   */
  async login(data: LoginValues): Promise<LoginResponse> {
    try {
      const res = await API.post(ENDPOINTS.AUTH.LOGIN, data);

      const { token, user } = res.data;

      syncAuth(token, user);

      return res.data;
    } catch (err) {
      return fail(err);
    }
  },

  /**
   * GUEST SESSION
   */
  async guest(data?: { fullName?: string; email?: string }) {
    try {
      reset();

      const res = await API.post(ENDPOINTS.AUTH.GUEST, {
        fullName: data?.fullName || "Guest User",
        email: data?.email || `guest_${Date.now()}@temp.local`,
      });

      const { token, user } = res.data;
      syncGuest(user, token);

      return res.data;
    } catch (err) {
      return fail(err);
    }
  },

  /**
   * GET CURRENT USER
   */
  async getMe(): Promise<LoginResponse> {
    try {
      const token = storage.get(STORAGE_KEYS.TOKEN);

      if (!token) throw new Error("No session");

      setAuthHeader(token);

      const res = await API.get(ENDPOINTS.AUTH.ME);

      if (res.data?.user) setUser(res.data.user);

      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 401) reset();
      return fail(err);
    }
  },

  /**
   * LOGOUT
   */
  async logout() {
    try {
      const token = storage.get(STORAGE_KEYS.TOKEN);

      if (token) {
        setAuthHeader(token);

        const res = await API.post(ENDPOINTS.AUTH.LOGOUT);

        notifySuccess(res?.data?.message);
      }
    } catch (err) {
      notifyErrorOnce(err);
    } finally {
      reset();
      window.dispatchEvent(new Event("auth-change"));
    }
  },

  /**
   * SWITCH MODE
   */
  switch(user: any, token?: string | null) {
    reset();

    if (token) syncAuth(token, user);
    else syncGuest(user);
  },

  /**
   * CHECKS
   */
  isAuth() {
    return Boolean(storage.get(STORAGE_KEYS.TOKEN));
  },

  isGuest() {
    const user = authService.getUser();
    return Boolean(user?.isGuest);
  },

  getUser() {
    const raw = storage.get(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
};

export default authService;
