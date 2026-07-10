import { useState, useCallback } from "react";
import API from "@/api/api";
import { notifyErrorOnce, notifySuccess } from "@/api/notify";
import { ENDPOINTS } from "@/api/endpoints";
import {
  UserProfile,
  UpdateProfileValues,
  UpdateProfileResponse,
} from "@/types/users";

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
 * TOKEN
 * =====================================================
 */
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  return token;
};

const setToken = (token: string | null) => {
  if (typeof window === "undefined") return;

  if (!token) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

/**
 * =====================================================
 * MODE CHECKS
 * =====================================================
 */
const isAuthenticated = (): boolean => !!getToken();

/**
 * =====================================================
 * USER STORAGE
 * =====================================================
 */
const getStoredUser = (): UserProfile | null => {
  if (typeof window === "undefined") return null;

  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const setStoredUser = (user: UserProfile | null) => {
  if (typeof window === "undefined") return;

  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

const clearUser = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * =====================================================
 * AUTH HEADERS
 * =====================================================
 */
const buildAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * =====================================================
 * HOOK
 * =====================================================
 */
export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(getStoredUser());
  const [error, setError] = useState<string | null>(null);

  /**
   * =====================================================
   * SYNC PROFILE
   * =====================================================
   */
  const syncProfile = useCallback((user: UserProfile | null) => {
    setProfile(user);
    setStoredUser(user);
  }, []);

  /**
   * =====================================================
   * GET PROFILE
   * =====================================================
   */
  const getProfile = async (): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.get(ENDPOINTS.USERS.PROFILE, {
        headers: buildAuthHeaders(),
      });

      syncProfile(res.data.user);
      return res.data.user;
    } catch (err: any) {
      setError(err?.message || "Failed to fetch profile");

      if (err?.response?.status === 401) {
        setToken(null);
        clearUser();
        setProfile(null);
      }

      notifyErrorOnce(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * =====================================================
   * UPDATE PROFILE
   * =====================================================
   */
  const updateProfile = async (
    data: UpdateProfileValues,
  ): Promise<UpdateProfileResponse> => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.patch(ENDPOINTS.USERS.UPDATE_PROFILE, data, {
        headers: buildAuthHeaders(),
      });

      syncProfile(res.data.user);
      notifySuccess("Profile updated successfully");

      return res.data;
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");

      if (err?.response?.status === 401) {
        setToken(null);
        clearUser();
        setProfile(null);
      }

      notifyErrorOnce(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * =====================================================
   * RESET USER
   * =====================================================
   */
  const resetUser = () => {
    setToken(null);
    clearUser();
    setProfile(null);
    setError(null);
  };

  /**
   * =====================================================
   * MODE SWITCHING (CLEAN + CONSISTENT)
   * =====================================================
   */
  const logout = () => {
    if (typeof window === "undefined") return;

    setToken(null);
    clearUser();
    setProfile(null);
    setError(null);
  };

  /**
   * =====================================================
   * DERIVED STATE (NO STALE VALUES)
   * =====================================================
   */
  const authState = {
    isAuthenticated: isAuthenticated(),
    isGuest: Boolean(profile?.isGuest),
  };

  return {
    loading,
    profile,
    error,
    getProfile,
    updateProfile,
    resetUser,
    logout,
    setUser: syncProfile,
    ...authState,
  };
};
