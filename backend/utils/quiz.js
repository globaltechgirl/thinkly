"use strict";

// =====================================================
// QUIZ STATES
// =====================================================
const STATES = Object.freeze({
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  ENDED: "ENDED",
});

// =====================================================
// LIFECYCLE TRANSITIONS
// =====================================================
const LIFECYCLE_TRANSITIONS = Object.freeze({
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: [],
});

// =====================================================
// RUNTIME TRANSITIONS
// =====================================================
const RUNTIME_TRANSITIONS = Object.freeze({
  INACTIVE: ["ACTIVE"],
  ACTIVE: ["PAUSED", "ENDED"],
  PAUSED: ["ACTIVE", "ENDED"],
  ENDED: [],
});

// =====================================================
// 🔥 IDENTITY RESOLUTION (CRITICAL FIX: IDENTFY = GUEST ID)
// =====================================================
const resolveIdentity = (user = {}) => {
  const isGuest = Boolean(user.isGuest || user.guestId);

  return {
    userId: user.id || null,
    guestId: isGuest ? user.guestId : null,
    isGuest,
    identityKey: isGuest ? user.guestId : user.id || null,
  };
};

// =====================================================
// HELPERS
// =====================================================
const isValidState = (state) =>
  Object.values(STATES).includes(state);

const normalize = (val) =>
  typeof val === "string" ? val.toUpperCase().trim() : val;

// =====================================================
// FIXED OWNERSHIP CHECK (USER + GUEST SAFE)
// =====================================================
const isOwner = (quiz, user) => {
  if (!quiz || !user) return false;

  const identity = resolveIdentity(user);

  const quizOwnerId = quiz.createdBy?.toString?.();

  if (!quizOwnerId || !identity.identityKey) return false;

  return (
    quizOwnerId === identity.userId?.toString?.()
  );
};

// =====================================================
// ASSERT LIFECYCLE TRANSITION
// =====================================================
const assertLifecycleTransition = (from, to) => {
  const current = normalize(from);
  const next = normalize(to);

  const allowed = LIFECYCLE_TRANSITIONS[current] || [];

  if (!allowed.includes(next)) {
    throw new Error(`INVALID LIFECYCLE TRANSITION: ${current} → ${next}`);
  }

  return true;
};

// =====================================================
// ASSERT RUNTIME TRANSITION
// =====================================================
const assertRuntimeTransition = (from, to) => {
  const current = normalize(from);
  const next = normalize(to);

  const allowed = RUNTIME_TRANSITIONS[current] || [];

  if (!allowed.includes(next)) {
    throw new Error(`INVALID RUNTIME TRANSITION: ${current} → ${next}`);
  }

  return true;
};

// =====================================================
// GET ALLOWED TRANSITIONS
// =====================================================
const getAllowedTransitions = (state) => {
  const current = normalize(state);

  if (!isValidState(current)) return [];

  return {
    ...LIFECYCLE_TRANSITIONS,
    ...RUNTIME_TRANSITIONS,
  }[current] || [];
};

// =====================================================
// RUNTIME STATUS ENGINE
// =====================================================
const getRuntimeStatus = (quiz) => {
  if (!quiz) return "UNKNOWN";

  const now = Date.now();

  const status = normalize(quiz.status);
  const runtime = normalize(quiz.runtimeStatus);

  if (status === STATES.ARCHIVED) return STATES.ARCHIVED;
  if (status === STATES.DRAFT) return STATES.DRAFT;

  if (quiz.startTime && now < new Date(quiz.startTime).getTime()) {
    return "SCHEDULED";
  }

  if (quiz.endTime && now > new Date(quiz.endTime).getTime()) {
    return STATES.ENDED;
  }

  if (runtime === STATES.PAUSED) return STATES.PAUSED;
  if (runtime === STATES.ENDED) return STATES.ENDED;
  if (runtime === STATES.ACTIVE) return "LIVE";

  if (status === STATES.PUBLISHED && runtime === STATES.INACTIVE) {
    return "PUBLISHED";
  }

  return "UNKNOWN";
};

// =====================================================
// QUIZ VISIBILITY (FIXED SAFE ACCESS)
// =====================================================
const canUserViewQuiz = (quiz, user) => {
  if (!quiz || !user) return false;

  if (isOwner(quiz, user)) return true;

  return normalize(quiz.status) === STATES.PUBLISHED;
};

// =====================================================
// QUIZ TAKE ACCESS (STRICT ISOLATION)
// =====================================================
const canUserTakeQuiz = (quiz, user) => {
  if (!quiz || !user) return false;

  if (isOwner(quiz, user)) return false;

  const status = normalize(quiz.status);
  const runtime = normalize(quiz.runtimeStatus);

  if (status !== STATES.PUBLISHED) return false;
  if (runtime === STATES.PAUSED) return false;
  if (runtime === STATES.ENDED) return false;

  if (quiz.endTime && Date.now() > new Date(quiz.endTime).getTime()) {
    return false;
  }

  return true;
};

// =====================================================
// ANSWER VISIBILITY
// =====================================================
const canUserSeeAnswers = ({ quiz, user, hasAttempt }) => {
  if (!quiz || !user) return false;

  if (isOwner(quiz, user)) return true;

  return Boolean(hasAttempt);
};

// =====================================================
// ANALYTICS ACCESS (OWNER ONLY)
// =====================================================
const canUserViewAnalytics = (quiz, user) => {
  if (!quiz || !user) return false;

  return isOwner(quiz, user);
};

// =====================================================
// RESULTS ACCESS
// =====================================================
const canUserViewResults = (quiz, user) => {
  if (!quiz || !user) return false;
  return normalize(quiz.status) === STATES.PUBLISHED;
};

// =====================================================
// SANITIZE QUESTIONS
// =====================================================
const sanitizeQuestions = (questions = [], canSeeAnswers = false) => {
  return questions.map((q) => {
    const base = {
      id: q._id?.toString?.(),
      question: q.question,
      options: q.options,
      points: q.points || 1,
    };

    if (canSeeAnswers) {
      base.correctOption = q.correctOption;
      base.explanation = q.explanation;
    }

    return base;
  });
};

// =====================================================
// SCORE CALCULATOR
// =====================================================
const calculateScore = (questions = [], answers = {}) => {
  let score = 0;
  let total = 0;

  questions.forEach((q, index) => {
    const correct = q.correctOption;
    const userAnswer = answers[index];
    const points = q.points || 1;

    total += points;

    if (userAnswer === correct) {
      score += points;
    }
  });

  const percentage = total > 0 ? (score / total) * 100 : 0;

  return {
    score,
    total,
    percentage,
  };
};

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  STATES,
  LIFECYCLE_TRANSITIONS,
  RUNTIME_TRANSITIONS,

  resolveIdentity, // 🔥 CORE FIX (IDENTFY SYSTEM)

  isValidState,
  normalize,
  isOwner,

  assertLifecycleTransition,
  assertRuntimeTransition,
  getAllowedTransitions,
  getRuntimeStatus,

  canUserViewQuiz,
  canUserTakeQuiz,
  canUserSeeAnswers,
  canUserViewAnalytics,
  canUserViewResults,

  sanitizeQuestions,
  calculateScore,
};