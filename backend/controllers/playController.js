"use strict";

const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

const Quiz = require("../models/quiz");
const { Attempt, ATTEMPT_STATES } = require("../models/attempt");

/**
 * =====================================================
 * VALIDATION
 * =====================================================
 */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * =====================================================
 * USER CONTEXT
 * =====================================================
 */
const getUserContext = (req) => {
  const user = req.user || {};

  const guestId = user.guestId ? String(user.guestId).trim() : null;
  const userId = user.id ? String(user.id) : null;

  const isGuest = Boolean(user.isGuest || !userId);

  const ctx = {
    userId,
    guestId,
    isGuest,
    role: user.role || "guest",
  };
  
  return ctx;
};

/**
 * =====================================================
 * LOAD QUIZ
 * =====================================================
 */
const loadQuiz = async (quizId) => {
  const quiz = await Quiz.findById(quizId)
    .populate("createdBy", "fullName profilePicture")
    .lean();

  if (!quiz) {
    return null;
  }

  return quiz;
};

/**
 * =====================================================
 * VALIDATE QUIZ ACCESS
 * =====================================================
 */
const validateQuizAccess = (quiz) => {
  if (!quiz) {
    return {
      valid: false,
      status: 404,
      message: "Quiz not found",
    };
  }

  if (quiz.status !== "PUBLISHED") {
    return {
      valid: false,
      status: 403,
      message: "Quiz not available",
    };
  }

  if (quiz.endTime && new Date() > new Date(quiz.endTime)) {
    return {
      valid: false,
      status: 403,
      message: "Quiz expired",
    };
  }

  return { valid: true };
};

/**
 * =====================================================
 * BUILD FILTER
 * =====================================================
 */
const buildFilter = ({ quizId, userId, guestId }) => {
  if (!quizId) {
    throw new Error("Missing quizId");
  }

  const query = {
    quiz: quizId,
  };

  if (guestId) {
    query.guestId = guestId;
    return query;
  }

  if (userId) {
    query.guestId = `user_${userId}`;
    return query;
  }

  throw new Error("Missing identity");
};

/**
 * =====================================================
 * FIND ATTEMPT
 * =====================================================
 */
const findExistingAttempt = async (params) => {
  const filter = buildFilter(params);

  return Attempt.findOne(filter);
};

/**
 * =====================================================
 * CREATE ATTEMPT
 * =====================================================
 */
const createAttempt = async ({ quizId, userId, guestId, isGuest, req }) => {
  const filter = buildFilter({
    quizId,
    userId,
    guestId,
    isGuest,
  });

  const baseData = {
    quiz: quizId,
    status: ATTEMPT_STATES.IN_PROGRESS,
    startedAt: new Date(),
    answers: {},
    score: 0,
    totalScore: 0,
    percentage: 0,
    leaderboardScore: 0,
    breakdown: [],
    meta: {
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.headers?.["user-agent"] || null,
    },
  };

  if (guestId) {
    baseData.guestId = guestId;
  }

  if (userId) {
    baseData.user = userId;
  }

  const existing = await Attempt.findOne(filter);
  if (existing) {
    return existing;
  }

  try {
    const attempt = await Attempt.create(baseData);

    return attempt;
  } catch (err) {
    if (err.code === 11000) {
      const retry = await Attempt.findOne(filter);

      if (retry) return retry;
    }

    throw err;
  }
};

/**
 * =====================================================
 * SANITIZE QUESTIONS
 * =====================================================
 */
const sanitizeQuestions = (questions = []) =>
  questions.map((q, i) => ({
    index: i,
    question: q.question,
    options: q.options,
    points: q.points || 1,
  }));

/**
 * =====================================================
 * MAIN CONTROLLER
 * =====================================================
 */
const playQuizSession = asyncHandler(async (req, res) => {
  const quizId = req.params.id;

  if (!isValidId(quizId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid quiz ID",
    });
  }

  const ctx = getUserContext(req);

  if (!ctx.userId && !ctx.guestId) {
    return res.status(401).json({
      success: false,
      message: "No session found",
    });
  }

  const quiz = await loadQuiz(quizId);

  const validation = validateQuizAccess(quiz);

  if (!validation.valid) {
    return res.status(validation.status).json({
      success: false,
      message: validation.message,
    });
  }

  const questions = sanitizeQuestions(quiz.questions || []);

  const attempt = await findExistingAttempt({
    quizId,
    userId: ctx.userId,
    guestId: ctx.guestId,
    isGuest: ctx.isGuest,
  });

  if (attempt?.status === ATTEMPT_STATES.SUBMITTED) {
    return res.json({
      success: true,
      message: "Quiz already completed",
      data: {
        quiz,
        questions,
        attempt,
        hasSubmitted: true,
        isResumed: false,
      },
    });
  }

  if (attempt?.status === ATTEMPT_STATES.IN_PROGRESS) {
    return res.json({
      success: true,
      message: "Quiz resumed",
      data: {
        quiz,
        questions,
        attempt,
        isResumed: true,
      },
    });
  }

  const newAttempt = await createAttempt({
    quizId,
    userId: ctx.userId,
    guestId: ctx.guestId,
    isGuest: ctx.isGuest,
    req,
  });

  return res.json({
    success: true,
    message: "Quiz started",
    data: {
      quiz,
      questions,
      attempt: newAttempt,
      isResumed: false,
    },
  });
});

module.exports = {
  playQuizSession,
};