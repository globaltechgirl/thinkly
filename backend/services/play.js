"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");

const Quiz = require("../models/quiz");
const { Attempt, ATTEMPT_STATES } = require("../models/attempt");
const attemptService = require("./attempt.service");

/**
 * =====================================================
 * SERVICE ERROR
 * =====================================================
 */
class ServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * =====================================================
 * OBJECT ID VALIDATION
 * =====================================================
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * =====================================================
 * GUEST ID GENERATOR (IMMUTABLE IDENTITY CORE)
 * =====================================================
 */
const generateGuestId = () => {
  return `guest_${crypto.randomBytes(16).toString("hex")}`;
};

/**
 * =====================================================
 * ERROR THROWER
 * =====================================================
 */
const throwError = (message, status = 400) => {
  throw new ServiceError(message, status);
};

/**
 * =====================================================
 * QUIZ VALIDATION
 * =====================================================
 */
const assertQuizCanBePlayed = (quiz) => {
  if (!quiz) throwError("Quiz not found", 404);

  if ((quiz.status || "").toUpperCase() !== "PUBLISHED") {
    throwError("Quiz is not published", 403);
  }

  if (quiz.runtimeStatus && quiz.runtimeStatus !== "ACTIVE") {
    throwError("Quiz is not active", 403);
  }

  if (quiz.endTime && new Date() > new Date(quiz.endTime)) {
    throwError("Quiz has expired", 403);
  }
};

/**
 * =====================================================
 * FIND ACTIVE ATTEMPT (STRICT IDENTITY ISOLATION)
 * =====================================================
 */
const findActiveAttempt = async ({ quizId, userId, guestId }) => {
  const base = {
    quiz: quizId,
    status: ATTEMPT_STATES.IN_PROGRESS,
  };

  if (userId) {
    return Attempt.findOne({
      ...base,
      user: userId,
    });
  }

  if (guestId) {
    return Attempt.findOne({
      ...base,
      guestId,
    });
  }

  return null;
};

/**
 * =====================================================
 * START QUIZ SESSION (CORE ENTRY POINT)
 * =====================================================
 */
exports.startQuizSession = async ({ quizId, userId = null, guest = null }) => {
  if (!isValidObjectId(quizId)) {
    throwError("Invalid quiz ID", 400);
  }

  const quiz = await Quiz.findById(quizId);

  assertQuizCanBePlayed(quiz);

  /**
   * =====================================================
   * GUEST ID RESOLUTION (CRITICAL FIX)
   * =====================================================
   * RULE:
   * - guestId MUST persist across ALL sessions
   * - NEVER regenerate if provided
   */
  let guestId = null;
  let guestSnapshot = null;

  if (!userId) {
    if (!guest?.fullName || !guest?.email) {
      throwError("Guest fullName and email required", 400);
    }

    guestId = guest.guestId || generateGuestId();

    guestSnapshot = {
      fullName: guest.fullName.trim(),
      email: guest.email.trim().toLowerCase(),
    };
  }

  /**
   * =====================================================
   * RESUME ATTEMPT (PRESERVE HISTORY)
   * =====================================================
   */
  const existingAttempt = await findActiveAttempt({
    quizId,
    userId,
    guestId,
  });

  if (existingAttempt) {
    return existingAttempt;
  }

  /**
   * =====================================================
   * CREATE NEW ATTEMPT
   * =====================================================
   */
  const attemptData = {
    quiz: quizId,
    status: ATTEMPT_STATES.IN_PROGRESS,
    startedAt: new Date(),
    answers: {},
    score: 0,
    totalScore: 0,
    percentage: 0,
  };

  if (userId) {
    attemptData.user = userId;
  } else {
    attemptData.guestId = guestId;
    attemptData.guestSnapshot = guestSnapshot;
  }

  const attempt = await Attempt.create(attemptData);

  return attempt;
};

/**
 * =====================================================
 * SAVE PROGRESS (PARTIAL ANSWERS)
 * =====================================================
 */
exports.saveProgress = async ({
  attemptId,
  answers = {},
  userId = null,
  guestId = null,
}) => {
  if (!isValidObjectId(attemptId)) {
    throwError("Invalid attempt ID", 400);
  }

  const attempt = await Attempt.findById(attemptId);

  if (!attempt) throwError("Attempt not found", 404);

  if (attempt.status !== ATTEMPT_STATES.IN_PROGRESS) {
    throwError("Attempt is not active", 400);
  }

  /**
   * =====================================================
   * STRICT OWNERSHIP CHECK (NO CROSS ACCESS)
   * =====================================================
   */
  const isOwner =
    (userId && attempt.user?.toString() === userId?.toString()) ||
    (guestId && attempt.guestId === guestId);

  if (!isOwner) {
    throwError("Unauthorized access", 403);
  }

  /**
   * =====================================================
   * MERGE ANSWERS SAFELY
   * =====================================================
   */
  attempt.answers = {
    ...(attempt.answers || {}),
    ...answers,
  };

  await attempt.save();

  return attempt;
};

/**
 * =====================================================
 * SUBMIT QUIZ SESSION (FINAL SCORING)
 * =====================================================
 */
exports.submitQuizSession = async ({
  attemptId,
  userId = null,
  guestId = null,
}) => {
  if (!isValidObjectId(attemptId)) {
    throwError("Invalid attempt ID", 400);
  }

  const attempt = await Attempt.findById(attemptId).populate("quiz");

  if (!attempt) throwError("Attempt not found", 404);

  if (attempt.status === ATTEMPT_STATES.SUBMITTED) {
    throwError("Quiz already submitted", 400);
  }

  /**
   * =====================================================
   * STRICT OWNERSHIP CHECK
   * =====================================================
   */
  const isOwner =
    (userId && attempt.user?.toString() === userId?.toString()) ||
    (guestId && attempt.guestId === guestId);

  if (!isOwner) {
    throwError("Unauthorized access", 403);
  }

  /**
   * =====================================================
   * DELEGATE TO SCORING ENGINE
   * =====================================================
   */
  const result = await attemptService.submitAttempt(
    attempt.quiz._id,
    attempt.user || null,
    attempt.answers,
    attempt.guestId || null,
  );

  return result;
};
