"use strict";

const router = require("express").Router();

/**
 * =====================================================
 * CONTROLLERS
 * =====================================================
 */
const quizController = require("../controllers/quizController");
const playController = require("../controllers/playController");

/**
 * =====================================================
 * MODELS (SAFE USAGE ONLY)
 * =====================================================
 */
const { Attempt } = require("../models/attempt");

/**
 * =====================================================
 * MIDDLEWARE
 * =====================================================
 */
const { protect, authorizeRoles, optionalAuth } = require("../middleware/auth");

const { validateRequest } = require("../middleware/validateRequest");

const {
  createQuizValidator,
  updateQuizValidator,
  quizIdValidator,
} = require("../validators/quiz");

const {
  loadQuiz,
  loadQuizQuestionsPublic,
  loadQuizQuestionsAdmin,
  requireOwnership,
  canTakeQuiz,
  canViewQuiz,
  canViewAnalytics,
  canViewResults,
  validateSubmission,
  checkQuizAvailability,
} = require("../middleware/quiz");

/**
 * =====================================================
 * SAFE WRAPPER
 * =====================================================
 */
const safeAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * =====================================================
 * HELPER: IDENTITY ENFORCEMENT (CRITICAL FIX)
 * =====================================================
 */
const resolveIdentityFilter = (req) => {
  const userId = req.user?.id || null;
  const guestId = req.user?.guestId || null;

  if (userId) {
    return { user: userId };
  }

  if (guestId) {
    return { guestId };
  }

  return null;
};

/**
 * =====================================================
 * PUBLIC ROUTES
 * =====================================================
 */

router.get(
  "/published",
  optionalAuth,
  safeAsync(quizController.getPublishedQuizzes),
);

router.get(
  "/play/slug/:slug",
  optionalAuth,
  safeAsync(quizController.getQuizBySlug),
);

router.get(
  "/:id/view",
  optionalAuth,
  quizIdValidator,
  validateRequest,
  loadQuiz,
  canViewQuiz,
  checkQuizAvailability,
  safeAsync((req, res) => {
    const quiz = req.quiz;

    const quizData = {
      id: quiz._id,
      quizName: quiz.quizName,
      description: quiz.description,
      companyName: quiz.companyName,
      contactName: quiz.contactName,
      contactEmail: quiz.contactEmail,
      status: quiz.status,
      runtimeStatus: quiz.runtimeStatus,
      startTime: quiz.startTime,
      endTime: quiz.endTime,
      activeDuration: quiz.activeDuration,
      lastStartedAt: quiz.lastStartedAt,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      quizLink: quiz.slug ? `/play/${quiz.slug}` : "",
      slug: quiz.slug,
      subdomain: quiz.subdomain,
      creatorName: quiz.createdBy?.fullName || "",
      creatorImage: quiz.createdBy?.profilePicture || null,
    };

    return res.json({
      success: true,
      data: {
        quiz: quizData,
      },
    });
  }),
);

/**
 * =====================================================
 * PLAY QUIZ
 * =====================================================
 */
router.get(
  "/:id/play",
  optionalAuth,
  quizIdValidator,
  validateRequest,
  loadQuiz,
  checkQuizAvailability,
  loadQuizQuestionsPublic,
  safeAsync(playController.playQuizSession),
);

/**
 * =====================================================
 * SUBMIT QUIZ
 * =====================================================
 */
router.post(
  "/:id/submit",
  optionalAuth,
  quizIdValidator,
  validateRequest,
  loadQuiz,
  checkQuizAvailability,
  canTakeQuiz,
  validateSubmission,
  safeAsync(quizController.submitQuiz),
);

/**
 * =====================================================
 * RESULTS 
 * =====================================================
 */
router.get(
  "/:id/results",
  optionalAuth,
  quizIdValidator,
  validateRequest,
  loadQuiz,
  canViewResults,
  safeAsync(async (req, res) => {
    const filter = {
      quiz: req.quiz._id,
      status: "SUBMITTED",
    };

    const attempts = await Attempt.find(filter)
      .populate("user", "fullName profilePicture")
      .sort({ score: -1, submittedAt: 1 });

    return res.json({
      success: true,
      data: {
        totalAttempts: attempts.length,
        averageScore: req.quiz.averageScore,
        results: attempts.map((a, index) => ({
          id: a._id,
          user: {
            id: a.user?._id || null,
            name: a.user?.fullName || a.guestSnapshot?.fullName || "Guest User",
            image: a.user?.profilePicture || "",
          },
          guestSnapshot: a.guestSnapshot || null,
          score: a.score,
          totalScore: a.totalScore,
          percentage: a.percentage,
          position: index + 1,
          status: a.status,
          startedAt: a.startedAt,
          submittedAt: a.submittedAt,
        })),
      },
    });
  }),
);

/**
 * =====================================================
 * ADMIN ROUTES
 * =====================================================
 */

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createQuizValidator,
  validateRequest,
  safeAsync(quizController.createQuiz),
);

router.get(
  "/mine",
  protect,
  authorizeRoles("admin"),
  safeAsync(quizController.getAdminQuizzes),
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  quizIdValidator,
  validateRequest,
  loadQuiz,
  requireOwnership,
  loadQuizQuestionsAdmin,
  safeAsync(quizController.getQuiz),
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  quizIdValidator,
  updateQuizValidator,
  validateRequest,
  loadQuiz,
  requireOwnership,
  safeAsync(quizController.updateQuiz),
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  quizIdValidator,
  validateRequest,
  loadQuiz,
  requireOwnership,
  safeAsync(quizController.deleteQuiz),
);

/**
 * =====================================================
 * QUIZ STATE MANAGEMENT
 * =====================================================
 */
router.patch(
  "/:id/publish",
  protect,
  authorizeRoles("admin"),
  quizIdValidator,
  validateRequest,
  loadQuiz,
  requireOwnership,
  safeAsync(quizController.publishQuiz),
);

router.patch(
  "/:id/start",
  protect,
  authorizeRoles("admin"),
  quizIdValidator,
  validateRequest,
  loadQuiz,
  requireOwnership,
  safeAsync(quizController.startQuiz),
);

router.patch(
  "/:id/pause",
  protect,
  authorizeRoles("admin"),
  quizIdValidator,
  validateRequest,
  loadQuiz,
  requireOwnership,
  safeAsync(quizController.pauseQuiz),
);

router.patch(
  "/:id/resume",
  protect,
  authorizeRoles("admin"),
  quizIdValidator,
  validateRequest,
  loadQuiz,
  requireOwnership,
  safeAsync(quizController.resumeQuiz),
);

router.patch(
  "/:id/end",
  protect,
  authorizeRoles("admin"),
  quizIdValidator,
  validateRequest,
  loadQuiz,
  requireOwnership,
  safeAsync(quizController.endQuiz),
);

router.patch(
  "/:id/archive",
  protect,
  authorizeRoles("admin"),
  quizIdValidator,
  validateRequest,
  loadQuiz,
  requireOwnership,
  safeAsync(quizController.archiveQuiz),
);

/**
 * =====================================================
 * ANALYTICS
 * =====================================================
 */
router.get(
  "/:id/analytics",
  protect,
  authorizeRoles("admin"),
  quizIdValidator,
  validateRequest,
  loadQuiz,
  requireOwnership,
  canViewAnalytics,
  safeAsync((req, res) => {
    return res.json({
      success: true,
      data: {
        totalAttempts: req.quiz.totalAttempts,
        averageScore: req.quiz.averageScore,
      },
    });
  }),
);

/**
 * =====================================================
 * LEADERBOARD
 * =====================================================
 */
router.get(
  "/:id/leaderboard",
  optionalAuth,
  quizIdValidator,
  validateRequest,
  loadQuiz,
  canViewResults,
  safeAsync(async (req, res) => {
    const leaderboard = await Attempt.find({
      quiz: req.quiz._id,
      status: "SUBMITTED",
    })
      .populate("user", "fullName profilePicture")
      .sort({ score: -1, submittedAt: 1 })
      .lean();

    return res.json({ success: true, data: { leaderboard } });
  }),
);

module.exports = router;