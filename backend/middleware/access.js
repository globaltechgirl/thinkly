const Quiz = require("../models/quiz");
const Attempt = require("../models/attempt");

/**
 * =====================================================
 * SAFE USER ID RESOLVER
 * =====================================================
 */
const getUserId = (user) => {
  return (
    user?.id ||
    user?._id ||
    user?.userId ||
    null
  )?.toString?.() || null;
};

/**
 * =====================================================
 * SAFE GUEST ID RESOLVER (🔥 CRITICAL FIX)
 * =====================================================
 * guestId = PRIMARY identity for history + attempts
 */
const getGuestId = (req) => {
  return (
    req?.identity?.guestId ||
    req?.user?.guestId ||
    null
  ) || null;
};

/**
 * =====================================================
 * VIEW QUIZ
 * =====================================================
 */
exports.canViewQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const userId = getUserId(req.user);
    const ownerId = quiz.createdBy?.toString?.();

    const isOwner = userId && ownerId && userId === ownerId;
    const isAdmin = req.user?.role === "admin";
    const isPublished = quiz.status === "published";

    if (isAdmin || isOwner) {
      req.quiz = quiz;
      req.isOwner = isOwner;
      return next();
    }

    if (!isPublished) {
      return res.status(403).json({
        success: false,
        message: "Quiz not available",
      });
    }

    req.quiz = quiz;
    req.isOwner = false;

    return next();
  } catch (error) {
    console.error("canViewQuiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * =====================================================
 * QUIZ OWNERSHIP ONLY
 * =====================================================
 */
exports.requireQuizOwnership = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const userId = getUserId(req.user);
    const ownerId = quiz.createdBy?.toString?.();

    if (!userId || userId !== ownerId) {
      return res.status(403).json({
        success: false,
        message: "Only quiz owner can perform this action",
      });
    }

    req.quiz = quiz;
    req.isOwner = true;

    next();
  } catch (error) {
    console.error("requireQuizOwnership error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * =====================================================
 * TAKE QUIZ ACCESS CONTROL
 * =====================================================
 */
exports.canTakeQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const userId = getUserId(req.user);
    const ownerId = quiz.createdBy?.toString?.();
    const isPublished = quiz.status === "published";

    if (!isPublished) {
      return res.status(403).json({
        success: false,
        message: "Quiz not available for attempts",
      });
    }

    if (userId && ownerId && userId === ownerId) {
      return res.status(403).json({
        success: false,
        message: "You cannot take your own quiz",
      });
    }

    req.quiz = quiz;

    return next();
  } catch (error) {
    console.error("canTakeQuiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * =====================================================
 * VIEW ANSWERS (🔥 FIXED GUEST ISOLATION)
 * =====================================================
 */
exports.canViewAnswers = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const userId = getUserId(req.user);
    const guestId = getGuestId(req); // 🔥 CRITICAL FIX
    const ownerId = quiz.createdBy?.toString?.();
    const isAdmin = req.user?.role === "admin";

    if (isAdmin || (userId && ownerId && userId === ownerId)) {
      req.canViewAnswers = true;
      req.quiz = quiz;
      return next();
    }

    /**
     * =================================================
     * CORE FIX: identity-first attempt lookup
     * guestId ALWAYS takes priority for guests
     * =================================================
     */
    let attempt = null;

    if (userId) {
      attempt = await Attempt.findOne({
        quiz: quiz._id,
        user: userId,
      }).lean();
    }

    if (!attempt && guestId) {
      attempt = await Attempt.findOne({
        quiz: quiz._id,
        guestId: guestId,
      }).lean();
    }

    req.canViewAnswers = Boolean(attempt);
    req.quiz = quiz;

    return next();
  } catch (error) {
    console.error("canViewAnswers error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * =====================================================
 * VIEW ANALYTICS
 * =====================================================
 */
exports.canViewAnalytics = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const userId = getUserId(req.user);
    const ownerId = quiz.createdBy?.toString?.();
    const isAdmin = req.user?.role === "admin";

    const isOwner = userId && ownerId && userId === ownerId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to view analytics",
      });
    }

    req.quiz = quiz;
    req.isOwner = isOwner;

    return next();
  } catch (error) {
    console.error("canViewAnalytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};