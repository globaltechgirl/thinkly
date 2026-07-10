import { useState, useCallback, useRef } from "react";
import quizService from "@/services/quiz";
import type {
  CreateQuizPayload,
  Participant,
  Quiz,
  QuizWithQuestions,
} from "@/types/quiz";
import { APP_BASE_URL } from "@/utils/constants";

type QuizState = {
  quizzes: Quiz[];
  currentQuiz: QuizWithQuestions | null;
  results: any[];
  loading: boolean;
  error: string | null;
};

type LoadingKeys =
  | "fetch"
  | "create"
  | "update"
  | "delete"
  | "fetchOne"
  | "publish";

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
          name: attemptSource?.user?.name ?? "Unknown",
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
      if (runtime === "PAUSED") return "PAUSED";
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

const mapQuestionsToPayload = (questions: any[] = []) => {
  const cleaned: CreateQuizPayload["questions"] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    const options = Array.isArray(q?.options)
      ? q.options.map((o: any) => String(o).trim()).filter(Boolean)
      : [];

    const question = String(q?.question ?? "").trim();
    const correctOption = Number(q?.correctOption);

    const candidate = {
      question: question,
      options,
      correctOption,
    };

    cleaned.push(candidate);
  }

  return cleaned;
};

const normalizeAttempt = (a: any) => ({
  id: a.id ?? a._id,
  quiz: {
    id: a.quiz?.id,
    name: a.quiz?.name,
    slug: a.quiz?.slug,
  },
  user: {
    id: a.user?.id,
    name: a.user?.name,
    image: a.user?.image,
  },
  score: a.score ?? 0,
  totalScore: a.totalScore ?? 0,
  percentage: a.percentage ?? 0,
  status: a.status,
  startedAt: a.startedAt,
  submittedAt: a.submittedAt,
  position: a.position,
});

export const useQuiz = () => {
  const [state, setState] = useState<QuizState>({
    quizzes: [],
    currentQuiz: null,
    results: [],
    loading: false,
    error: null,
  });

  const [adminAttempts, setAdminAttempts] = useState<any[]>([]);

  const loadingRef = useRef<Record<LoadingKeys, boolean>>({
    fetch: false,
    create: false,
    update: false,
    delete: false,
    fetchOne: false,
    publish: false,
  });

  const setLoading = (key: LoadingKeys, value: boolean) => {
    loadingRef.current[key] = value;

    const anyLoading = Object.values(loadingRef.current).some(Boolean);

    setState((prev) => ({
      ...prev,
      loading: anyLoading,
    }));
  };

  const setError = (error: string | null) =>
    setState((prev) => ({ ...prev, error }));
  const fetchAdminQuizzes = useCallback(async () => {
    try {
      setLoading("fetch", true);
      setError(null);

      const { quizzes } = await quizService.getAdminAll();

      const normalized = (quizzes ?? []).map((q, i) => {
        const result = normalizeQuiz(q, i);
        return result;
      });

      const sorted = normalized.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      );

      setState((prev) => ({
        ...prev,
        quizzes: sorted,
      }));

      return sorted;
    } catch (err) {
      throw err;
    } finally {
      setLoading("fetch", false);
    }
  }, []);

  const fetchAdminQuiz = useCallback(async (id: string) => {
    try {
      setLoading("fetchOne", true);
      setError(null);

      const res = await quizService.getAdminOne(id);

      const data: QuizWithQuestions = {
        quiz: normalizeQuiz(res.quiz, 0),
        questions: res.questions ?? [],
        attempts: res.attempts ?? [],
      };

      setState((prev) => ({
        ...prev,
        currentQuiz: data,
      }));

      return data;
    } finally {
      setLoading("fetchOne", false);
    }
  }, []);

  const fetchAdminAttempts = useCallback(async () => {
    try {
      setLoading("fetch", true);
      setError(null);

      const res = await quizService.getAdminAllAttempts();

      const normalized = (res ?? []).map((item: any) => {
        const mapped = normalizeAttempt(item);
        return mapped;
      });

      setAdminAttempts(normalized);
      return normalized;
    } catch (err) {
      throw err;
    } finally {
      setLoading("fetch", false);
    }
  }, []);

  const fetchUserQuizzes = useCallback(async () => {
    try {
      setLoading("fetch", true);
      setError(null);

      const { quizzes } = await quizService.getUserAll();

      setState((prev) => ({
        ...prev,
        quizzes: (quizzes ?? []).map((q, i) => normalizeQuiz(q, i)),
      }));

      return quizzes;
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      throw error;
    } finally {
      setLoading("fetch", false);
    }
  }, []);

  const fetchUserQuiz = useCallback(async (id: string) => {
    try {
      setLoading("fetchOne", true);
      setError(null);

      const res = await quizService.getUserOne(id);

      const data: QuizWithQuestions = {
        quiz: normalizeQuiz(res.quiz, 0),
        questions: res.questions ?? [],
        attempts: res.attempts ?? [],
      };

      setState((prev) => ({
        ...prev,
        currentQuiz: data,
      }));

      return data;
    } finally {
      setLoading("fetchOne", false);
    }
  }, []);

  const createQuiz = useCallback(
    async (form: any) => {
      try {
        setLoading("create", true);
        setError(null);

        const payload: CreateQuizPayload = {
          quizName: (form?.quizName ?? "").trim(),
          description: form?.description?.trim(),
          companyName: form?.companyName?.trim(),
          contactName: form?.contactName?.trim(),
          contactEmail: form?.contactEmail?.trim(),
          endTime: form?.endTime,
          questions: mapQuestionsToPayload(form?.questions),
        };

        const res = await quizService.create(payload);
        await fetchAdminQuizzes();
        return res;
      } finally {
        setLoading("create", false);
      }
    },
    [fetchAdminQuizzes],
  );

  const updateQuiz = useCallback(
    async (id: string, form: any) => {
      try {
        setLoading("update", true);
        setError(null);

        const payload: CreateQuizPayload = {
          quizName: (form?.quizName ?? "").trim(),
          description: form?.description?.trim(),
          companyName: form?.companyName?.trim(),
          contactName: form?.contactName?.trim(),
          contactEmail: form?.contactEmail?.trim(),
          endTime: form?.endTime,
          questions: mapQuestionsToPayload(form?.questions),
        };

        const res = await quizService.update(id, payload);
        await fetchAdminQuizzes();
        return res;
      } finally {
        setLoading("update", false);
      }
    },
    [fetchAdminQuizzes],
  );

  const publishQuiz = useCallback(
    async (id: string) => {
      try {
        setLoading("publish", true);
        setError(null);

        await quizService.publish(id);
        await fetchAdminQuizzes();
        return true;
      } finally {
        setLoading("publish", false);
      }
    },
    [fetchAdminQuizzes],
  );

  const deleteQuiz = useCallback(
    async (id: string) => {
      try {
        setLoading("delete", true);
        setError(null);

        await quizService.remove(id);
        await fetchAdminQuizzes();
        setState((prev) => ({
          ...prev,
          currentQuiz:
            prev.currentQuiz?.quiz.id === id ? null : prev.currentQuiz,
        }));

        return true;
      } finally {
        setLoading("delete", false);
      }
    },
    [fetchAdminQuizzes],
  );

  const playQuiz = useCallback(async (id: string) => {
    try {
      setLoading("fetchOne", true);
      setError(null);

      const res = await quizService.play(id);

      const data: QuizWithQuestions = {
        quiz: res?.quiz,
        questions: res?.questions || [],
        attempts: res.attempts ?? [],
      };

      setState((prev) => ({
        ...prev,
        currentQuiz: data,
      }));

      return data;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading("fetchOne", false);
    }
  }, []);

  const playQuizBySlug = useCallback(async (slug: string) => {
    try {
      setLoading("fetchOne", true);
      setError(null);

      const res = await quizService.playBySlug(slug);

      const data: QuizWithQuestions = {
        quiz: res?.quiz,
        questions: res?.questions || [],
        attempts: res?.attempts ?? [],
      };

      setState((prev) => ({
        ...prev,
        currentQuiz: data,
      }));

      return data;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading("fetchOne", false);
    }
  }, []);

  const submitQuiz = useCallback(async (id: string, payload: any) => {
    try {
      setLoading("update", true);
      setError(null);

      const res = await quizService.submit(id, payload);

      return res;
    } finally {
      setLoading("update", false);
    }
  }, []);

  const fetchResults = useCallback(async (quizId: string) => {
    try {
      setLoading("fetchOne", true);
      setError(null);

      const data = await quizService.getResults(quizId);
      const sorted = [...data].sort((a, b) => b.score - a.score);

      setState((prev) => ({
        ...prev,
        results: sorted,
      }));

      return sorted;
    } finally {
      setLoading("fetchOne", false);
    }
  }, []);

  return {
    ...state,
    fetchAdminQuizzes,
    fetchAdminQuiz,
    createQuiz,
    updateQuiz,
    publishQuiz,
    deleteQuiz,
    fetchUserQuizzes,
    fetchUserQuiz,
    playQuiz,
    playQuizBySlug,
    submitQuiz,
    fetchResults,
    adminAttempts,
    fetchAdminAttempts,
    loadingRef,
  };
};