"use strict";

const mongoose = require("mongoose");
const Quiz = require("../models/quiz");

const {
  STATES,
  assertLifecycleTransition,
  assertRuntimeTransition,
} = require("../utils/quiz");

class ServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * =====================================================
 * ID VALIDATION
 * =====================================================
 */
const assertValidId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Invalid ID", 400);
  }
};

/**
 * =====================================================
 * SLUG GENERATION
 * =====================================================
 */
const generateSlug = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const generateSubdomain = (name = "") => {
  const cleaned = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (!cleaned.length) return "quiz";
  if (cleaned.length === 1) return cleaned[0];

  return `${cleaned[0]}${cleaned
    .slice(1)
    .map((w) => w[0])
    .join("")}`;
};

/**
 * =====================================================
 * OWNERSHIP CHECK
 * =====================================================
 */
const assertOwnership = (quiz, userId) => {
  if (!quiz) throw new ServiceError("Quiz not found", 404);

  if (!userId || quiz.createdBy.toString() !== userId.toString()) {
    throw new ServiceError("Unauthorized", 403);
  }
};

/**
 * =====================================================
 * SANITIZE QUIZ (CRITICAL FIX)
 * Prevents answer leakage in published quizzes
 * =====================================================
 */
const sanitizeQuiz = (quiz) => {
  if (!quiz) return null;

  const q = quiz.toObject ? quiz.toObject() : quiz;

  if (Array.isArray(q.questions)) {
    q.questions = q.questions.map((question) => {
      const { correctOption, answer, correctAnswer, ...safe } =
        question;
      return safe;
    });
  }

  return q;
};

/**
 * =====================================================
 * OWNED QUIZ FETCHER
 * =====================================================
 */
const getOwnedQuiz = async (quizId, userId) => {
  assertValidId(quizId);

  const quiz = await Quiz.findOne({
    _id: quizId,
    createdBy: userId,
  });

  if (!quiz) {
    throw new ServiceError("Quiz not found or unauthorized", 404);
  }

  return quiz;
};

/**
 * =====================================================
 * CREATE QUIZ
 * =====================================================
 */
exports.createQuiz = async (data, userId) => {
  if (!userId) throw new ServiceError("User required", 401);

  const quiz = await Quiz.create({
    ...data,
    slug: data.slug || generateSlug(data.quizName),
    subdomain: generateSubdomain(data.quizName),
    createdBy: userId,

    status: STATES.DRAFT,
    runtimeStatus: STATES.INACTIVE,

    totalAttempts: 0,
    averageScore: 0,
  });

  return quiz;
};

/**
 * =====================================================
 * GET ADMIN QUIZZES
 * =====================================================
 */
exports.getAdminQuizzes = async (userId) => {
  assertValidId(userId);

  return Quiz.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * =====================================================
 * GET PUBLISHED QUIZZES
 * =====================================================
 */
exports.getPublishedQuizzes = async () => {
  const quizzes = await Quiz.find({ status: STATES.PUBLISHED })
    .sort({ createdAt: -1 })
    .populate("createdBy", "fullName profilePicture")
    .lean();

  // IMPORTANT FIX:
  // NEVER expose correct answers in published feed
  return quizzes.map((q) => sanitizeQuiz(q));
};

/**
 * =====================================================
 * GET QUIZ BY SLUG
 * =====================================================
 */
exports.getQuizBySlug = async (slug) => {
  if (!slug) throw new ServiceError("Slug required", 400);

  const quiz = await Quiz.findOne({
    slug,
    status: STATES.PUBLISHED,
  }).populate("createdBy", "fullName profilePicture");

  if (!quiz) throw new ServiceError("Quiz not available", 404);

  return sanitizeQuiz(quiz);
};

/**
 * =====================================================
 * GET QUIZ (SAFE FOR BOTH OWNER + USER)
 * =====================================================
 */
exports.getQuiz = async (quizId, user) => {
  assertValidId(quizId);

  const quiz = await Quiz.findById(quizId);

  if (!quiz) throw new ServiceError("Quiz not found", 404);

  const isOwner =
    user?.id &&
    quiz.createdBy.toString() === user.id.toString();

  if (isOwner) return quiz;

  if (quiz.status !== STATES.PUBLISHED) {
    throw new ServiceError("Quiz not available", 403);
  }

  return sanitizeQuiz(quiz);
};

/**
 * =====================================================
 * UPDATE QUIZ
 * =====================================================
 */
exports.updateQuiz = async (quizId, data, userId) => {
  const quiz = await getOwnedQuiz(quizId, userId);

  if (quiz.status !== STATES.DRAFT) {
    throw new ServiceError("Only draft quizzes editable", 400);
  }

  Object.assign(quiz, data);
  await quiz.save();

  return quiz;
};

/**
 * =====================================================
 * DELETE QUIZ
 * =====================================================
 */
exports.deleteQuiz = async (quizId, userId) => {
  assertValidId(quizId);

  const quiz = await Quiz.findOneAndDelete({
    _id: quizId,
    createdBy: userId,
  });

  if (!quiz) throw new ServiceError("Quiz not found", 404);

  return true;
};

/**
 * =====================================================
 * PUBLISH QUIZ
 * =====================================================
 */
exports.publishQuiz = async (quizId, userId) => {
  const quiz = await getOwnedQuiz(quizId, userId);

  if (!quiz.questions?.length) {
    throw new ServiceError("Quiz must have questions", 400);
  }

  assertLifecycleTransition(quiz.status, STATES.PUBLISHED);

  quiz.status = STATES.PUBLISHED;
  quiz.runtimeStatus = STATES.INACTIVE;

  await quiz.save();
  return quiz;
};

/**
 * =====================================================
 * START QUIZ
 * =====================================================
 */
exports.startQuiz = async (quizId, userId) => {
  const quiz = await getOwnedQuiz(quizId, userId);

  if (quiz.status !== STATES.PUBLISHED) {
    throw new ServiceError("Must be published first", 400);
  }

  assertRuntimeTransition(quiz.runtimeStatus, STATES.ACTIVE);

  quiz.runtimeStatus = STATES.ACTIVE;
  quiz.lastStartedAt = new Date();

  await quiz.save();
  return quiz;
};

/**
 * =====================================================
 * PAUSE QUIZ
 * =====================================================
 */
exports.pauseQuiz = async (quizId, userId) => {
  const quiz = await getOwnedQuiz(quizId, userId);

  assertRuntimeTransition(quiz.runtimeStatus, STATES.PAUSED);

  if (quiz.lastStartedAt) {
    const now = Date.now();

    quiz.activeDuration =
      (quiz.activeDuration || 0) +
      (now - new Date(quiz.lastStartedAt).getTime());

    quiz.lastStartedAt = null;
  }

  quiz.runtimeStatus = STATES.PAUSED;

  await quiz.save();
  return quiz;
};

/**
 * =====================================================
 * RESUME QUIZ
 * =====================================================
 */
exports.resumeQuiz = async (quizId, userId) => {
  const quiz = await getOwnedQuiz(quizId, userId);

  assertRuntimeTransition(quiz.runtimeStatus, STATES.ACTIVE);

  quiz.runtimeStatus = STATES.ACTIVE;
  quiz.lastStartedAt = new Date();

  await quiz.save();
  return quiz;
};

/**
 * =====================================================
 * END QUIZ
 * =====================================================
 */
exports.endQuiz = async (quizId, userId) => {
  const quiz = await getOwnedQuiz(quizId, userId);

  if (quiz.lastStartedAt) {
    const now = Date.now();

    quiz.activeDuration =
      (quiz.activeDuration || 0) +
      (now - new Date(quiz.lastStartedAt).getTime());
  }

  quiz.lastStartedAt = null;
  quiz.runtimeStatus = STATES.ENDED;
  quiz.endTime = new Date();

  await quiz.save();
  return quiz;
};

/**
 * =====================================================
 * ARCHIVE QUIZ
 * =====================================================
 */
exports.archiveQuiz = async (quizId, userId) => {
  const quiz = await getOwnedQuiz(quizId, userId);

  assertLifecycleTransition(quiz.status, STATES.ARCHIVED);

  quiz.status = STATES.ARCHIVED;

  await quiz.save();
  return quiz;
};