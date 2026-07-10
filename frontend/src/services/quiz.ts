import API from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { notifyErrorOnce, notifySuccess } from "@/api/notify";
import type {
  Quiz,
  QuizWithQuestions,
  CreateQuizPayload,
  CreateQuizResponse,
  QuizPlayResponse,
  Participant,
} from "@/types/quiz";
import { APP_BASE_URL } from "@/utils/constants";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: any;
};

type QuizListResponse = {
  quizzes?: any[];
  meta?: any;
};

let globalRefetchQuizzes: (() => Promise<any>) | null = null;
let refreshInFlight: Promise<any> | null = null;

export const setQuizRefetchHandler = (fn: () => Promise<any>) => {
  globalRefetchQuizzes = fn;
};

const refresh = async () => {
  if (!globalRefetchQuizzes) return;

  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = globalRefetchQuizzes().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

const handleRequest = async <T>(
  request: Promise<{ data: ApiEnvelope<T> }>,
  options?: {
    successMessage?: string;
    showSuccess?: boolean;
    errorMessage?: string;
  },
): Promise<T> => {
  try {
    const res = await request;

    if (!res?.data) throw new Error("Invalid API response");

    const payload = res.data;

    if (payload.success && options?.showSuccess) {
      notifySuccess(payload.message || options.successMessage || "Success");
    }

    return payload.data;
  } catch (err: any) {
    const backendMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message;

    const finalMessage =
      options?.errorMessage || backendMessage || "Something went wrong";

    notifyErrorOnce(finalMessage);

    const cleanError = new Error(finalMessage);
    (cleanError as any).status = err?.response?.status;

    throw cleanError;
  }
};

const normalizeParticipants = (attempts: any[] = []): Participant[] => {
  const list: Participant[] = [];

  for (const attempt of attempts) {
    const id =
      attempt?.guestId ?? attempt?.user?.id ?? attempt?.user?._id ?? null;

    if (!id) continue;

    const normalizedId = String(id);

    if (list.some((item) => item.id === normalizedId)) continue;

    const name =
      attempt?.user?.name ??
      attempt?.user?.fullName ??
      attempt?.guestSnapshot?.fullName ??
      "Unknown";

    const avatar = attempt?.user?.image ?? attempt?.user?.profilePicture ?? "";

    list.push({
      id: normalizedId,
      name,
      avatar,
    });
  }

  return list;
};

const normalizeQuiz = (q: any, index: number): Quiz => {
  const participants: Participant[] = Array.isArray(q?.participants)
    ? q.participants
    : Array.isArray(q?.attempts)
      ? normalizeParticipants(q.attempts)
      : [];

  const attemptSource = q?.myAttempt ?? q?.attempt ?? null;

  const attempt = attemptSource
    ? {
        id: attemptSource.id ?? attemptSource._id ?? null,
        score: Number(attemptSource.score ?? 0),
        totalScore: Number(attemptSource.totalScore ?? 0),
        percentage: Number(attemptSource.percentage ?? 0),
        status: attemptSource.status,
        startedAt: attemptSource.startedAt ?? null,
        submittedAt: attemptSource.submittedAt ?? null,
        user: {
          id: attemptSource?.user?.id ?? attemptSource?.user?._id ?? null,
          name:
            attemptSource?.user?.name ??
            attemptSource?.guestSnapshot?.fullName ??
            "Unknown",
          image: attemptSource?.user?.image ?? "",
        },
      }
    : null;

  const bestAttempt = q?.myAttempt ?? q?.attempt ?? null;

  const position = bestAttempt?.position ?? q?.position ?? null;

  return {
    id: String(q?._id ?? q?.id ?? `quiz-${index}`),
    quizName: q?.quizName ?? "",
    description: q?.description ?? "",
    companyName: q?.companyName ?? "",
    contactName: q?.contactName ?? "",
    contactEmail: q?.contactEmail ?? "",
    slug: q?.slug ?? "",
    subdomain: q?.subdomain ?? "",
    quizLink: q?.slug ? `${APP_BASE_URL}/play/${q.slug}` : "",
    creatorName: q?.creatorName ?? q?.createdBy?.fullName ?? "",
    creatorImage: q?.creatorImage ?? q?.createdBy?.profilePicture ?? null,
    status: attemptSource?.status ?? q?.status ?? "PENDING",
    runtimeStatus: (() => {
      const runtime = q?.runtimeStatus ?? "INACTIVE";
      if (q?.endTime && Date.now() > new Date(q.endTime).getTime())
        return "ENDED";
      if (runtime === "ACTIVE") return "ACTIVE";
      if (
        (q?.status || "").toUpperCase() === "PUBLISHED" &&
        runtime === "INACTIVE"
      )
        return "PUBLISHED";
      return runtime;
    })(),
    startTime: q?.startTime ?? null,
    endTime: q?.endTime ?? null,
    activeDuration: Number(q?.activeDuration ?? 0),
    lastStartedAt: q?.lastStartedAt ?? null,
    progress: attempt?.percentage ?? q?.percentage ?? 0,
    attempt,
    participants,
    responses: Number(q?.responses ?? 0),
    position,
    createdAt: q?.createdAt ?? null,
    updatedAt: q?.updatedAt ?? null,
  };
};

const normalizeQuestion = (q: any, index: number) => ({
  id: String(q?._id ?? q?.id ?? `q-${index}`),
  question: q?.question ?? "",
  options: Array.isArray(q?.options) ? q.options : [],
  correctOption: typeof q?.correctOption === "number" ? q.correctOption : null,
  explanation: q?.explanation ?? "",
});

const extractQuizArray = (data: any): any[] => {
  if (!data) return [];

  if (Array.isArray(data?.quizzes)) return data.quizzes;
  if (Array.isArray(data?.data?.quizzes)) return data.data.quizzes;
  if (Array.isArray(data)) return data;

  return [];
};

const quizService = {
  /* CREATE */
  create: async (data: CreateQuizPayload) => {
    const res = await handleRequest<CreateQuizResponse["data"]>(
      API.post(ENDPOINTS.QUIZ.CREATE, data),
      { showSuccess: false },
    );

    await refresh();
    return res;
  },

  /* ADMIN ALL */
  getAdminAll: async () => {
    const res = await handleRequest<QuizListResponse>(
      API.get(ENDPOINTS.QUIZ.ADMIN_LIST),
    );

    const raw = extractQuizArray(res);

    const quizzes = raw.map((q, i) => {
      const normalized = normalizeQuiz(q, i);
      return normalized;
    });

    const sorted = quizzes.sort((a, b) => {
      const timeA = new Date(a.createdAt ?? 0).getTime();
      const timeB = new Date(b.createdAt ?? 0).getTime();
      return timeB - timeA;
    });

    return { quizzes: sorted };
  },

  /* ADMIN ONE */
  getAdminOne: async (id: string): Promise<QuizWithQuestions> => {
    const res = await handleRequest<any>(
      API.get(ENDPOINTS.QUIZ.ADMIN_GET_ONE(id)),
    );

    const quiz = {
      ...(res?.quiz ?? {}),
      attempts: res?.attempts ?? [],
      myAttempt: res?.myAttempt ?? null,
    };

    const questions = res?.questions ?? [];
    const normalizedQuiz = normalizeQuiz(quiz, 0);
    const normalizedQuestions = questions.map((q: any, i: number) => {
      const nq = normalizeQuestion(q, i);
      return nq;
    });

    const result = {
      quiz: normalizedQuiz,
      questions: normalizedQuestions,
      attempts: res?.attempts ?? [],
    };

    return result;
  },

  /* ATTEMPT SUMMARY */
  getAttemptSummary: async (attemptId: string) => {
    const res = await handleRequest<any>(
      API.get(ENDPOINTS.ATTEMPTS.SUMMARY(attemptId)),
    );
    return res;
  },

  /* ADMIN ALL ATTEMPTS */
  getAdminAllAttempts: async () => {
    const res = await API.get(ENDPOINTS.ATTEMPTS.ADMIN_ALL);

    return res?.data?.data ?? [];
  },

  /* USER ALL */
  getUserAll: async () => {
    const res = await handleRequest<QuizListResponse>(
      API.get(ENDPOINTS.QUIZ.USER_LIST),
    );

    const raw = extractQuizArray(res);

    const quizzes = raw
      .map((q, i) => {
        const normalized = normalizeQuiz(q, i);

        return normalized;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      );

    return { quizzes };
  },

  /* USER ONE */
  getUserOne: async (id: string): Promise<QuizWithQuestions> => {
    const res = await handleRequest<any>(API.get(ENDPOINTS.QUIZ.VIEW(id)));

    const quiz = res?.quiz ?? res;
    const questions = res?.questions ?? [];
    const normalizedQuiz = normalizeQuiz(quiz, 0);

    return {
      quiz: normalizedQuiz,
      questions: questions.map(normalizeQuestion),
      attempts: res.attempts ?? [],
    };
  },

  /* UPDATE */
  update: async (id: string, data: CreateQuizPayload) => {
    const res = await handleRequest(API.put(ENDPOINTS.QUIZ.UPDATE(id), data), {
      showSuccess: false,
    });

    await refresh();
    return res;
  },

  /* PUBLISH */
  publish: async (id: string) => {
    const res = await handleRequest(API.patch(ENDPOINTS.QUIZ.PUBLISH(id)), {
      showSuccess: false,
    });

    await refresh();
    return res;
  },

  /* DELETE */
  remove: async (id: string) => {
    const res = await handleRequest(API.delete(ENDPOINTS.QUIZ.DELETE(id)), {
      showSuccess: false,
    });

    await refresh();
    return res;
  },

  /* START */
  start: async (id: string) => {
    const res = await handleRequest(API.patch(ENDPOINTS.QUIZ.START(id)), {
      showSuccess: false,
      errorMessage: "Quiz must be published.",
    });

    await refresh();
    return res;
  },

  /* PAUSE */
  pause: async (id: string) => {
    const res = await handleRequest(API.patch(ENDPOINTS.QUIZ.PAUSE(id)), {
      showSuccess: false,
    });

    await refresh();
    return res;
  },

  /* RESUME */
  resume: async (id: string) => {
    const res = await handleRequest(API.patch(ENDPOINTS.QUIZ.RESUME(id)), {
      showSuccess: false,
    });

    await refresh();
    return res;
  },

  /* PLAY */
  play: async (id: string): Promise<QuizPlayResponse> => {
    let res;

    try {
      res = await handleRequest<any>(API.get(ENDPOINTS.QUIZ.PLAY(id)));
    } catch (err: any) {
      throw err;
    }

    const quiz = res?.quiz ?? {};
    const questions = res?.questions ?? [];
    const attemptStatus = String(res?.attempt?.status || "").toUpperCase();

    return {
      quiz: normalizeQuiz(quiz, 0),
      questions: questions.map(normalizeQuestion),
      hasSubmitted:
        (res?.hasSubmitted ?? attemptStatus === "SUBMITTED") ||
        Boolean(res?.attempt?.submittedAt),
      attempt: res?.attempt ?? null,
      attempts: res.attempts ?? [],
    };
  },

  /* PLAY BY SLUG */
  playBySlug: async (slug: string): Promise<QuizPlayResponse> => {
    let res;

    try {
      res = await handleRequest<any>(API.get(ENDPOINTS.QUIZ.GET_BY_SLUG(slug)));
    } catch (err: any) {
      throw err;
    }

    const quiz = res?.quiz ?? res ?? {};
    const questions = res?.questions ?? [];

    const result = {
      quiz: normalizeQuiz(quiz, 0),
      questions: questions.map(normalizeQuestion),
      hasSubmitted: res?.hasSubmitted ?? false,
      attempt: res?.attempt ?? null,
      attempts: res?.attempts ?? [],
    };

    return result;
  },

  /* SUBMIT */
  submit: async (id: string, payload: any) => {
    const res = await handleRequest(
      API.post(ENDPOINTS.QUIZ.SUBMIT(id), payload),
      { showSuccess: false },
    );

    await refresh();
    return res;
  },

  /* RESULTS */
  getResults: async (id: string) => {
    const res = await handleRequest<any>(API.get(ENDPOINTS.QUIZ.RESULTS(id)));

    const raw = res;

    const results = Array.isArray(raw?.results)
      ? raw.results
      : Array.isArray(raw)
        ? raw
        : [];

    const mapped = results.map((u: any, _i: number) => {
      const mappedItem = {
        id: u?.id,
        /**
         * CRITICAL FIX: Use guestSnapshot.fullName for guests
         * Prioritize: user.fullName > guestSnapshot.fullName > "Unknown"
         */
        name:
          u?.user?.name ??
          u?.user?.fullName ??
          u?.guestSnapshot?.fullName ??
          "Unknown",
        image: u?.user?.image ?? "",
        score: Number(u?.score ?? 0),
        totalScore: Number(u?.totalScore ?? 0),
        percentage: Number(u?.percentage ?? 0),
        status: u?.status,
        startedAt: u?.startedAt,
        submittedAt: u?.submittedAt,
        position: u?.position,
      };

      return mappedItem;
    });

    return mapped;
  },
};

export const triggerQuizRefresh = () => refresh();
export default quizService;