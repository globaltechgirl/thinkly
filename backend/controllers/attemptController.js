"use strict";

const asyncHandler = require("../utils/asyncHandler");
const attemptService = require("../services/attempt");
const authService = require("../services/auth");
const Quiz = require("../models/quiz");

/**
 * =====================================================
 * RESOLVE USER ID
 * =====================================================
 */
const resolveUserId = (req) => req.user?.id || null;

const resolveGuestId = async (req) => {
  const rawGuestId = req.user?.guestId || null;
  if (!rawGuestId) {
    return null;
  }

  return await authService.resolvePrimaryGuestId(rawGuestId);
};

/**
 * =====================================================
 * RESOLVE IDENTITY FILTER (CRITICAL FIX)
 * =====================================================
 */
const resolveIdentityFilter = async (req) => {
  const userId = resolveUserId(req);
  const guestId = await resolveGuestId(req);

  if (guestId) {
    return { guestId };
  }

  if (userId) {
    return { guestId: `user_${userId}` };
  }

  return null;
};

/**
 * =====================================================
 * VALIDATE ANSWERS 
 * =====================================================
 */
const validateAnswers = (answers) => {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return false;
  }

  const keys = Object.keys(answers);

  if (!keys.length) return false;

  return keys.every((key) => {
    const value = answers[key];

    return (
      typeof key === "string" &&
      (typeof value === "string" || typeof value === "number")
    );
  });
};

/**
 * =====================================================
 * SUBMIT ATTEMPT
 * =====================================================
 */
exports.submitAttempt = asyncHandler(async (req, res) => {
  const { id: quizId } = req.params;

  const userId = resolveUserId(req);
  const guestId = await resolveGuestId(req);
  const answers = req.body?.answers;

  if (!quizId) {
    return res.status(400).json({
      success: false,
      message: "Quiz ID is required",
    });
  }

  if (!validateAnswers(answers)) {
    return res.status(400).json({
      success: false,
      message: "Valid answers object is required",
    });
  }

  if (!userId && !guestId) {
    return res.status(401).json({
      success: false,
      message: "User session required",
    });
  }

  const quiz = await Quiz.findById(quizId).select("_id status isPublished");

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
    });
  }

  const isPublished = quiz.status === "PUBLISHED" || quiz.isPublished;

  if (!isPublished) {
    return res.status(403).json({
      success: false,
      message: "Quiz not available",
    });
  }

  const attempt = await attemptService.submitAttempt(
    quizId,
    userId,
    answers,
    guestId,
    req.user?.fullName || null,
    req.user?.email || null,
  );

  return res.status(201).json({
    success: true,
    message: "Quiz submitted successfully",
    data: attempt,
  });
});

/**
 * =====================================================
 * GET MY ATTEMPTS
 * =====================================================
 */
exports.getMyAttempts = asyncHandler(async (req, res) => {
  const identity = await resolveIdentityFilter(req);

  if (!identity) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const attempts = await attemptService.getUserAttempts(identity);

  return res.status(200).json({
    success: true,
    count: attempts.length,
    data: attempts,
  });
});

/**
 * =====================================================
 * GET SINGLE ATTEMPT
 * =====================================================
 */
exports.getAttemptById = asyncHandler(async (req, res) => {
  const identity = await resolveIdentityFilter(req);

  if (!identity) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const attempt = await attemptService.getAttempt(
    req.params.attemptId,
    identity,
  );

  if (!attempt) {
    return res.status(404).json({
      success: false,
      message: "Attempt not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: attempt,
  });
});

/**
 * =====================================================
 * GET QUIZ ATTEMPTS
 * =====================================================
 */
exports.getQuizAttempts = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const quiz = await Quiz.findById(req.params.id).select("createdBy");

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
    });
  }

  if (quiz.createdBy?.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to view quiz attempts",
    });
  }

  const attempts = await attemptService.getQuizAttempts(req.params.id, userId);

  return res.status(200).json({
    success: true,
    count: attempts.length,
    data: attempts,
  });
});

/**
 * =====================================================
 * DELETE ATTEMPT
 * =====================================================
 */
exports.deleteAttempt = asyncHandler(async (req, res) => {
  const identity = await resolveIdentityFilter(req);

  if (!identity) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  await attemptService.deleteAttempt(req.params.attemptId, identity);

  return res.status(200).json({
    success: true,
    message: "Attempt deleted successfully",
  });
});

/**
 * =====================================================
 * ATTEMPT SUMMARY
 * =====================================================
 */
exports.getMyAttemptSummary = asyncHandler(async (req, res) => {
  const identity = await resolveIdentityFilter(req);

  if (!identity) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const attempt = await attemptService.getAttempt(
    req.params.attemptId,
    identity,
  );

  if (!attempt) {
    return res.status(404).json({
      success: false,
      message: "Attempt not found",
    });
  }

  const quiz = await Quiz.findById(attempt.quiz)
    .select("createdBy totalAttempts averageScore")
    .lean();

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
    });
  }

  const isOwner = quiz.createdBy?.toString() === identity?.user?.toString?.();

  return res.status(200).json({
    success: true,
    data: {
      score: attempt.score,
      totalScore: attempt.totalScore,
      percentage: attempt.percentage,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers,

      ...(isOwner && {
        quizStats: {
          totalAttempts: quiz.totalAttempts || 0,
          averageScore: quiz.averageScore || 0,
        },
      }),
    },
  });
});

/**
 * =====================================================
 * ADMIN - GET ALL ATTEMPTS 
 * =====================================================
 */
exports.getAdminAllAttempts = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const attempts = await attemptService.getAllAdminAttempts(userId);

  return res.status(200).json({
    success: true,
    count: attempts.length,
    data: attempts,
  });
});
