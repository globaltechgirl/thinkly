export const ENDPOINTS = {
  /**
   * =====================================================
   * AUTH
   * =====================================================
   */
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    ME: "/auth/me",
    GUEST: "/auth/guest",
    LOGOUT: "/auth/logout",
  },

  /**
   * =====================================================
   * USERS
   * =====================================================
   */
  USERS: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    MERGE_GUEST: "/users/merge-guest",
  },

  /**
   * =====================================================
   * QUIZ (ADMIN + CORE SYSTEM)
   * =====================================================
   */
  QUIZ: {
    CREATE: "/quiz",
    ADMIN_LIST: "/quiz/mine",
    ADMIN_GET_ONE: (id: string) => `/quiz/${id}`,
    UPDATE: (id: string) => `/quiz/${id}`,
    DELETE: (id: string) => `/quiz/${id}`,

    PUBLISH: (id: string) => `/quiz/${id}/publish`,
    START: (id: string) => `/quiz/${id}/start`,
    PAUSE: (id: string) => `/quiz/${id}/pause`,
    RESUME: (id: string) => `/quiz/${id}/resume`,
    END: (id: string) => `/quiz/${id}/end`,
    ARCHIVE: (id: string) => `/quiz/${id}/archive`,

    USER_LIST: "/quiz/published",
    VIEW: (id: string) => `/quiz/${id}/view`,
    GET_BY_SLUG: (slug: string) => `/quiz/play/slug/${slug}`,

    PLAY: (id: string) => `/quiz/${id}/play`,
    SESSION: (id: string) => `/quiz/${id}/session`, 
    SUBMIT: (id: string) => `/quiz/${id}/submit`,
    RESULTS: (id: string) => `/quiz/${id}/results`,
    LEADERBOARD: (id: string) => `/quiz/${id}/leaderboard`,

    ANALYTICS: (id: string) => `/quiz/${id}/analytics`,
  },

  ATTEMPTS: {
    SUBMIT: (quizId: string) => `/attempts/quiz/${quizId}`,
    MY_ATTEMPTS: "/attempts/me",
    GET_ONE: (attemptId: string) => `/attempts/${attemptId}`,
    SUMMARY: (attemptId: string) => `/attempts/${attemptId}/summary`,
    QUIZ_ATTEMPTS: (quizId: string) => `/attempts/quiz/${quizId}/all`,
    DELETE: (attemptId: string) => `/attempts/${attemptId}`,

    ADMIN_ALL: "/attempts/admin/all",
  },

  LEADERBOARD: {
    QUIZ: (quizId: string) => `/leaderboard/quiz/${quizId}`,
    GLOBAL: "/leaderboard/global",
    USER: (userId: string) => `/leaderboard/user/${userId}`,
  },

  ANALYTICS: {
    ADMIN: "/analytics/admin",
    USER: "/analytics/user",
    QUIZ: (quizId: string) => `/analytics/quiz/${quizId}`,
  },

  SOCKET: {
    JOIN_QUIZ: "joinQuiz",
    LEAVE_QUIZ: "leaveQuiz",
    LEADERBOARD_UPDATE: "leaderboardUpdate",
    QUIZ_STARTED: "quizStarted",
    QUIZ_ENDED: "quizEnded",
  },
} as const;