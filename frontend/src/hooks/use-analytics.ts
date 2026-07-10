import { useState, useCallback } from "react";
import analyticsService from "@/services/analytics";

/**
 * =====================================================
 * TYPES
 * =====================================================
 */

export type MonthlySeries = {
  _id?: {
    year: number;
    month: number;
  };
  monthName?: string;
  year?: number;
  month?: number;
  total: number;
};

type MonthlySubmission = {
  _id: {
    year: number;
    month: number;
  };
  total: number;
};

type ActivityItem = {
  message: string;
  type: string;
  time: string;
};

type ActivityTimeline = {
  date: string;
  activities: ActivityItem[];
  started: number;
  submitted: number;
  updated?: number;
  published?: number;
  deleted?: number;
  total: number;
};

type ParticipantListItem = {
  id: string;
  userName: string;
  avatar?: string | null;
  quizName: string;
  status: string;
  score: number;
  position: number | null;
  responsesSubmitted: number;
  submittedAt?: string | Date | null;
};

type AdminNotification = {
  title: string;
  text: string;
  time?: string | Date | null;
  month?: string | null;
};

type AdminAnalyticsUI = {
  totalCreated: number;
  totalActive: number;
  totalParticipants: number;
  totalSubmissions: number;
  monthlySubmissions: MonthlySubmission[];
  monthlyQuizzes: MonthlySeries[];
  monthlyActiveQuizzes: MonthlySeries[];
  monthlyParticipants: MonthlySeries[];
  participantList: ParticipantListItem[];
  notifications: AdminNotification[];
  activityTimeline: ActivityTimeline[];
};

type DailyActivity = {
  date: string;
  started: number;
  submitted: number;
  total: number;
};

type ActivityFeedItem = {
  quizTitle: string;
  startTime: string | Date | null;
  endTime: string | Date | null;
  timeRange?: string | null;
  adminName: string;
  adminAvatar?: string | null;
  createdAt?: string | Date | null;
};

type UserNotification = {
  quizName: string;
  quizStartTime?: string | Date | null;
  quizEndTime?: string | Date | null;
  creatorAvatar?: string | null;
  creatorName: string;
  month?: string | null;
  year?: number | null;
  attemptScore?: number;
  attemptResponses?: number;
  responsesSubmitted?: number;
  attemptPosition?: number | null;
  submittedAt?: string | Date | null;
  attemptSubmittedAt?: string | Date | null;
};

type UserAnalyticsUI = {
  totalQuizzes: number;
  totalActiveQuizzes: number;
  totalAttempts: number;
  totalPendingQuizzes: number;
  totalWonQuizzes: number;
  monthlyAttempts: MonthlySeries[];
  monthlyQuizzes: MonthlySeries[];
  monthlyPendingQuizzes: MonthlySeries[];
  monthlyWonQuizzes: MonthlySeries[];
  monthlyActivities: MonthlySeries[];
  dailyActivities: DailyActivity[];
  activityFeed: ActivityFeedItem[];
  notifications: UserNotification[];
};

export const useAnalytics = () => {
  const [admin, setAdmin] = useState<AdminAnalyticsUI | null>(null);
  const [user, setUser] = useState<UserAnalyticsUI | null>(null);

  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * =====================================================
   * ADMIN ANALYTICS
   * =====================================================
   */
  const fetchAdminAnalytics = useCallback(async () => {
    try {
      setLoadingAdmin(true);
      setError(null);

      const data = await analyticsService.getAdminAnalytics();

      const mapped: AdminAnalyticsUI = {
        totalCreated: data?.totalCreated ?? 0,
        totalActive: data?.totalActive ?? 0,
        totalParticipants: data?.totalParticipants ?? 0,
        totalSubmissions: data?.totalSubmissions ?? 0,
        monthlySubmissions: data?.monthlySubmissions ?? [],
        monthlyQuizzes: data?.monthlyQuizzes ?? [],
        monthlyActiveQuizzes: data?.monthlyActiveQuizzes ?? [],
        monthlyParticipants: data?.monthlyParticipants ?? [],
        participantList: data?.participantList ?? [],
        notifications: data?.notifications ?? [],

        activityTimeline: (data?.activityTimeline ?? [])
          .map((day: any) => ({
            ...day,
            activities: (day?.activities ?? [])
              .filter(Boolean)
              .sort((a: any, b: any) => {
                const aTime = new Date(a?.time || 0).getTime();
                const bTime = new Date(b?.time || 0).getTime();
                return bTime - aTime;
              }),
          }))
          .sort((a: any, b: any) => {
            const aDate = new Date(a?.date || 0).getTime();
            const bDate = new Date(b?.date || 0).getTime();
            return bDate - aDate;
          }),
      };

      setAdmin(mapped);
      return mapped;
    } catch (err: any) {
      setError(err?.message || "Failed to fetch admin analytics");
      return null;
    } finally {
      setLoadingAdmin(false);
    }
  }, []);

  /**
   * =====================================================
   * USER ANALYTICS
   * =====================================================
   */
  const fetchUserAnalytics = useCallback(async () => {
    try {
      setLoadingUser(true);
      setError(null);

      const data = await analyticsService.getUserAnalytics();

      const mapped: UserAnalyticsUI = {
        totalQuizzes: data?.totalQuizzes ?? 0,
        totalActiveQuizzes: data?.totalActiveQuizzes ?? 0,
        totalAttempts: data?.totalAttempts ?? 0,
        totalPendingQuizzes: data?.totalPendingQuizzes ?? 0,
        totalWonQuizzes: data?.totalWonQuizzes ?? 0,
        monthlyAttempts: data?.monthlyAttempts ?? [],
        monthlyQuizzes: data?.monthlyQuizzes ?? [],
        monthlyPendingQuizzes: data?.monthlyPendingQuizzes ?? [],
        monthlyWonQuizzes: data?.monthlyWonQuizzes ?? [],
        monthlyActivities: data?.monthlyActivities ?? [],

        dailyActivities: (data?.dailyActivities ?? [])
          .slice()
          .sort((a: any, b: any) => {
            const aTime = new Date(a?.date || 0).getTime();
            const bTime = new Date(b?.date || 0).getTime();
            return bTime - aTime;
          }),

        activityFeed: (data?.activityFeed ?? [])
          .map((item: any) => ({
            quizTitle: item?.quizTitle ?? "Deleted Quiz",
            startTime: item?.startTime ?? null,
            endTime: item?.endTime ?? null,
            timeRange: item?.timeRange ?? null,
            adminName: item?.adminName ?? "Unknown Admin",
            adminAvatar: item?.adminAvatar ?? null,
            createdAt: item?.createdAt ?? null,
            attemptScore: item?.attemptScore ?? 0,
            attemptResponses: item?.attemptResponses ?? 0,
            responsesSubmitted: item?.responsesSubmitted ?? 0,
            attemptPosition: item?.attemptPosition ?? null,
            submittedAt: item?.submittedAt ?? null,
          }))
          .slice()
          .sort((a: any, b: any) => {
            const aTime = new Date(a?.endTime || 0).getTime();
            const bTime = new Date(b?.endTime || 0).getTime();
            return bTime - aTime;
          }),
        notifications: data?.notifications ?? [],
      };

      setUser(mapped);
      return mapped;
    } catch (err: any) {
      setError(err?.message || "Failed to fetch user analytics");
      return null;
    } finally {
      setLoadingUser(false);
    }
  }, []);

  /**
   * =====================================================
   * REFRESH ALL
   * =====================================================
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchAdminAnalytics(), fetchUserAnalytics()]);
  }, [fetchAdminAnalytics, fetchUserAnalytics]);

  return {
    admin,
    user,
    loadingAdmin,
    loadingUser,
    loading: loadingAdmin || loadingUser,
    error,
    fetchAdminAnalytics,
    fetchUserAnalytics,
    refreshAll,
  };
};