import { useState } from "react";

import API from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { notifyErrorOnce } from "@/api/notify";
import { UserProfile, UpdateProfileValues, UpdateProfileResponse } from "@/types/users";

export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const getProfile = async (): Promise<UserProfile | null> => {
    setLoading(true);

    try {
      const res = await API.get<{ user: UserProfile }>(
        ENDPOINTS.USERS.PROFILE
      );

      setProfile(res.data.user);
      return res.data.user;
    } catch (err) {
      notifyErrorOnce(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const dispatchProfileUpdated = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("profile-updated"));
  };

  const updateProfile = async (
    data: UpdateProfileValues
  ): Promise<UpdateProfileResponse> => {
    setLoading(true);

    try {
      const res = await API.patch<UpdateProfileResponse>(
        ENDPOINTS.USERS.UPDATE_PROFILE,
        data
      );

      setProfile(res.data.user);
      dispatchProfileUpdated();

      return res.data;
    } catch (err) {
      notifyErrorOnce(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    profile,
    getProfile,
    updateProfile,
  };
};