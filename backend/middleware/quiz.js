const mongoose = require("mongoose");
const Quiz = require("../models/quiz");
const Question = require("../models/question");
const AttemptModule = require("../models/attempt");
const Attempt = AttemptModule?.Attempt || AttemptModule;
const sendError = require("../utils/sendError");
const { canUserTakeQuiz } = require("../utils/quiz");

/**
 * =====================================================
 * SAFE USER ID RESOLVER
 * =====================================================
 */
const getUserId = (user) =>
  (user?.id || user?._id || user?.userId || null)?.toString?.() || null;

/**
 * =====================================================
 * SAFE GUEST ID RESOLVER (🔥 CRITICAL FIX)
 * =====================================================
 * guestId is PRIMARY identity for history + attempts
 */
const getGuestId = (req) =>
  req?.identity?.guestId || req?.user?.guestId || null;

/**
 * =====================================================
 * NORMALIZE STATUS
 * =====================================================
 */
const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .toLowerCase();

/**
 * =====================================================
 * LOAD QUIZ
 * =====================================================
 */
const loadQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id || req.body.quizId;

    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return sendError(res, 400, "Invalid quiz ID");
    }

    const quiz = await Quiz.findById(quizId).populate(
      "createdBy",
      "fullName profilePicture _id",
    );

    if (!quiz) {
      return sendError(res, 404, "Quiz not found");
    }

    req.quiz = quiz;

    const userId = getUserId(req.user);
    const creatorId = quiz.createdBy?._id?.toString?.();

    req.isOwner = Boolean(userId && creatorId && userId === creatorId);
    req.isAdmin = req.user?.role === "admin";

    next();
  } catch (err) {
    console.error("loadQuiz error:", err);
    return sendError(res, 500, "Failed to load quiz");
  }
};

/**
 * =====================================================
 * LOAD QUESTIONS (ADMIN VIEW)
 * =====================================================
 */
const loadQuizQuestionsAdmin = async (req, res, next) => {
  try {
    const questions = await Question.find({
      quiz: req.quiz._id,
    }).select("question options correctOption explanation");

    req.quizQuestions = questions.map((q) => ({
      id: q._id.toString(),
      question: q.question,
      options: q.options,
      correctOption: q.correctOption,
      explanation: q.explanation,
    }));

    next();
  } catch (err) {
    console.error("loadQuizQuestionsAdmin error:", err);
    return sendError(res, 500, "Failed to load questions");
  }
};

/**
 * =====================================================
 * LOAD QUESTIONS (PUBLIC VIEW)
 * =====================================================
 */
const loadQuizQuestionsPublic = async (req, res, next) => {
  try {
    const quiz = req.quiz;

    if (!quiz) {
      return sendError(res, 400, "Quiz not loaded");
    }

    req.quizQuestions = (quiz.questions || []).map((q) => ({
      id: q._id?.toString?.() || null,
      question: q.question || "",
      options: q.options || [],
    }));

    next();
  } catch (err) {
    console.error("loadQuizQuestionsPublic error:", err);
    return sendError(res, 500, "Failed to load questions");
  }
};

/**
 * =====================================================
 * OWNERSHIP GUARD
 * =====================================================
 */
const requireOwnership = (req, res, next) => {
  if (!req.isOwner) {
    return sendError(res, 403, "Only quiz owner allowed");
  }
  next();
};

/**
 * =====================================================
 * VIEW QUIZ ACCESS CONTROL
 * =====================================================
 */
const canViewQuiz = (req, res, next) => {
  try {
    const quiz = req.quiz;

    if (!quiz) {
      return sendError(res, 400, "Quiz not loaded");
    }

    if (req.isOwner || req.isAdmin) return next();

    const status = normalizeStatus(quiz.status);

    if (status !== "published") {
      return sendError(res, 403, "Quiz not available");
    }

    next();
  } catch (err) {
    console.error("canViewQuiz error:", err);
    return sendError(res, 500, "View permission check failed");
  }
};

/**
 * =====================================================
 * TAKE QUIZ ACCESS CONTROL
 * =====================================================
 */
const canTakeQuiz = (req, res, next) => {
  try {
    const quiz = req.quiz;

    if (!quiz) {
      return sendError(res, 403, "Missing quiz context");
    }

    const userId = getUserId(req.user);
    const creatorId = quiz.createdBy?._id?.toString?.();

    if (userId && creatorId && userId === creatorId) {
      return sendError(res, 403, "Quiz owner cannot take their own quiz");
    }

    const safeUser = req.user || { isGuest: true };

    const allowed = canUserTakeQuiz(quiz, safeUser);

    if (!allowed) {
      return sendError(res, 403, "Not allowed to take this quiz");
    }

    next();
  } catch (err) {
    console.error("canTakeQuiz error:", err);
    return sendError(res, 500, "Failed to validate quiz access");
  }
};

/**
 * =====================================================
 * ANSWER VISIBILITY CONTROL (🔥 FIXED IDENTITY LOGIC)
 * =====================================================
 * RULE:
 * guestId is PRIMARY identity for attempts/history
 */
const canViewAnswers = async (req, res, next) => {
  try {
    const quiz = req.quiz;

    const userId = getUserId(req.user);
    const guestId = getGuestId(req); // 🔥 PRIMARY FIX

    if (req.isOwner || req.isAdmin) {
      req.canViewAnswers = true;
      return next();
    }

    /**
     * PRIORITY:
     * 1. userId (registered users)
     * 2. guestId (guests + converted users)
     */
    let attempt = null;

    if (guestId) {
      attempt = await Attempt.findOne({
        quiz: quiz._id,
        guestId,
      });
    } else if (userId) {
      attempt = await Attempt.findOne({
        quiz: quiz._id,
        guestId: `user_${userId}`,
      });
    }

    req.canViewAnswers = Boolean(attempt);
    next();
  } catch (err) {
    console.error("canViewAnswers error:", err);
    return sendError(res, 500, "Failed to check answer visibility");
  }
};

/**
 * =====================================================
 * ANALYTICS ACCESS CONTROL
 * =====================================================
 */
const canViewAnalytics = (req, res, next) => {
  if (!req.isOwner && !req.isAdmin) {
    return sendError(res, 403, "Access denied to analytics");
  }
  next();
};

/**
 * =====================================================
 * RESULTS ACCESS CONTROL
 * =====================================================
 */
const canViewResults = (req, res, next) => {
  next();
};

/**
 * =====================================================
 * QUIZ AVAILABILITY CHECK
 * =====================================================
 */
const checkQuizAvailability = (req, res, next) => {
  try {
    const quiz = req.quiz;

    const now = Date.now();
    const status = normalizeStatus(quiz.status);

    if (status === "archived") {
      return sendError(res, 403, "Quiz is archived");
    }

    if (status === "draft") {
      return sendError(res, 403, "Quiz not published yet");
    }

    const endTime = quiz.endTime ? new Date(quiz.endTime).getTime() : null;

    req.quiz.isExpired = status === "ended" || (endTime && now > endTime);

    next();
  } catch (err) {
    console.error("checkQuizAvailability error:", err);
    return sendError(res, 500, "Failed availability check");
  }
};

/**
 * =====================================================
 * SUBMISSION VALIDATION
 * =====================================================
 */
const validateSubmission = (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return sendError(res, 400, "Answers must be a valid object");
    }

    const keys = Object.keys(answers);

    if (!keys.length) {
      return sendError(res, 400, "No answers submitted");
    }

    for (const key of keys) {
      const value = answers[key];

      if (value === null || value === undefined) {
        return sendError(res, 400, `Missing answer for question ${key}`);
      }

      if (typeof value !== "number" || !Number.isFinite(value)) {
        return sendError(res, 400, `Invalid answer format for ${key}`);
      }
    }

    req.answers = answers;
    next();
  } catch (err) {
    console.error("validateSubmission error:", err);
    return sendError(res, 500, "Submission validation failed");
  }
};

module.exports = {
  loadQuiz,
  loadQuizQuestionsPublic,
  loadQuizQuestionsAdmin,
  requireOwnership,
  canViewQuiz,
  canTakeQuiz,
  canViewAnalytics,
  canViewResults,
  validateSubmission,
  checkQuizAvailability,
  canViewAnswers, // (kept safe + consistent)
};
