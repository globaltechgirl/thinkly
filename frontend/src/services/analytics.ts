import API from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";

/**
 * =====================================================
 * TYPES
 * =====================================================
 */

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type ActivityItem = {
  message: string;
  type: string;
  time: string;
};

type MonthlySeries = {
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

type AdminAnalytics = {
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
  attemptScore: number;
  attemptResponses: number;
  responsesSubmitted: number;
  attemptPosition: number | null;
  submittedAt?: string | Date | null;
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

type UserAnalytics = {
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

const extractData = <T>(res: any): T => {
  return res?.data?.data ?? res?.data ?? {};
};

const analyticsService = {
  // =====================================================
  // ADMIN ANALYTICS
  // =====================================================
  getAdminAnalytics: async (): Promise<AdminAnalytics> => {
    const res = await API.get<ApiResponse<AdminAnalytics>>(
      ENDPOINTS.ANALYTICS.ADMIN,
    );

    const data = extractData<AdminAnalytics>(res);

    const result = {
      totalCreated: data.totalCreated ?? 0,
      totalActive: data.totalActive ?? 0,
      totalParticipants: data.totalParticipants ?? 0,
      totalSubmissions: data.totalSubmissions ?? 0,
      monthlySubmissions: data.monthlySubmissions ?? [],
      monthlyQuizzes: data.monthlyQuizzes ?? [],
      monthlyActiveQuizzes: data.monthlyActiveQuizzes ?? [],
      monthlyParticipants: data.monthlyParticipants ?? [],
      participantList: data.participantList ?? [],
      notifications: data.notifications ?? [],

      activityTimeline: (data.activityTimeline ?? [])
        .map((day) => ({
          ...day,
          activities: (day.activities ?? [])
            .filter(Boolean)
            .sort(
              (a, b) =>
                new Date(b.time || 0).getTime() -
                new Date(a.time || 0).getTime(),
            ),
        }))
        .sort(
          (a, b) =>
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
        ),
    };

    return result;
  },

  // =====================================================
  // USER ANALYTICS
  // =====================================================
  getUserAnalytics: async (): Promise<UserAnalytics> => {
    const res = await API.get<ApiResponse<UserAnalytics>>(
      ENDPOINTS.ANALYTICS.USER,
    );

    const data = extractData<UserAnalytics>(res);

    const result = {
      totalQuizzes: data.totalQuizzes ?? 0,
      totalActiveQuizzes: data.totalActiveQuizzes ?? 0,
      totalAttempts: data.totalAttempts ?? 0,
      totalPendingQuizzes: data.totalPendingQuizzes ?? 0,
      totalWonQuizzes: data.totalWonQuizzes ?? 0,
      monthlyAttempts: data.monthlyAttempts ?? [],
      monthlyQuizzes: data.monthlyQuizzes ?? [],
      monthlyPendingQuizzes: data.monthlyPendingQuizzes ?? [],
      monthlyWonQuizzes: data.monthlyWonQuizzes ?? [],
      monthlyActivities: data.monthlyActivities ?? [],

      dailyActivities: (data.dailyActivities ?? [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
        ),

      activityFeed: (data?.activityFeed ?? [])
        .map((item: any) => ({
          quizTitle: item?.quizTitle ?? item?.quizName ?? "Deleted Quiz",
          startTime: item?.startTime ?? item?.quizStartTime ?? null,
          endTime: item?.endTime ?? item?.quizEndTime ?? null,
          timeRange: item?.timeRange ?? null,
          adminName: item?.adminName ?? "Unknown Admin",
          adminAvatar: item?.adminAvatar ?? null,
          createdAt: item?.createdAt ?? item?.attemptSubmittedAt ?? null,
          attemptScore: item?.attemptScore ?? 0,
          attemptResponses: item?.attemptResponses ?? 0,
          responsesSubmitted: item?.responsesSubmitted ?? 0,
          attemptPosition: item?.attemptPosition ?? null,
          submittedAt: item?.submittedAt ?? item?.attemptSubmittedAt ?? null,
        }))
        .slice()
        .sort((a, b) => {
          const aTime = new Date(a.endTime || a.createdAt || 0).getTime();
          const bTime = new Date(b.endTime || b.createdAt || 0).getTime();
          return bTime - aTime;
        }),
      notifications: data.notifications ?? [],
    };

    return result;
  },

  getQuizAnalytics: async (quizId: string): Promise<any> => {
    const res = await API.get<ApiResponse<any>>(
      ENDPOINTS.ANALYTICS.QUIZ(quizId),
    );

    const data = extractData<any>(res);
    
    return {
      quizId,
      totalAttempts: data.totalAttempts ?? 0,
      averageScore: data.averageScore ?? 0,
      topParticipants: Array.isArray(data.topParticipants)
        ? data.topParticipants
        : [],
      quiz: data.quiz ?? null,
      analytics: data,
    };
  },
};

export default analyticsService;