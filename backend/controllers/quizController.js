"use strict";

const mongoose = require("mongoose");

const quizService = require("../services/quiz");
const asyncHandler = require("../utils/asyncHandler");
const attemptService = require("../services/attempt");
const authService = require("../services/auth");
const { Attempt, ATTEMPT_STATES } = require("../models/attempt");
const leaderboardService = require("../services/leaderboard");
const User = require("../models/user");
const Quiz = require("../models/quiz");
const ActivityLog = require("../models/activity");
const UserQuizAccess = require("../models/userquiz");

/**
 * =====================================================
 * HELPERS
 * =====================================================
 */

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

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
 * STATUS MAPPER
 * =====================================================
 */
const mapAttemptStatus = (status) => {
  if (status === ATTEMPT_STATES.SUBMITTED || status === "SUBMITTED")
    return "completed";

  if (status === ATTEMPT_STATES.IN_PROGRESS || status === "IN_PROGRESS")
    return "ongoing";

  return "pending";
};

const formatAttempt = (a) => {
  if (!a) return null;

  return {
    id: a._id,
    score: a.score,
    totalScore: a.totalScore,
    percentage: a.percentage,
    status: a.status,
    startedAt: a.startedAt,
    submittedAt: a.submittedAt || null,
  };
};

/**
 * =====================================================
 * ADMIN ACTIVITY LOGGER
 * =====================================================
 */
const logQuizActivity = async ({
  type,
  adminId,
  quiz,
  fullName = "Admin",
  quizTitle,
  guestId,
}) => {
  try {
    if (!adminId || !type || !quiz) return;

    const quizId = quiz?._id || quiz;

    if (!isValidId(quizId)) return;

    await ActivityLog.log({
      admin: adminId,
      user: adminId,
      guestId: guestId || String(adminId),
      quiz: quizId,
      type,
      fullName,
      quizTitle: quizTitle || quiz?.quizName || "Untitled Quiz",
      preventDuplicate: true,
    });
  } catch (err) {
    console.error("[ActivityLog ERROR]:", err.message);
  }
};

/**
 * =====================================================
 * CREATE QUIZ
 * =====================================================
 */
exports.createQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.createQuiz(req.body, req.user.id);

  return res.status(201).json({
    success: true,
    message: "Quiz created successfully",
    data: quiz,
  });
});

/**
 * =====================================================
 * GET ADMIN QUIZZES
 * =====================================================
 */
exports.getAdminQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await quizService.getAdminQuizzes(req.user.id);

  const quizIds = quizzes.map((q) => q._id);

  const attempts = await Attempt.find({
    quiz: { $in: quizIds },
  })
    .populate("user", "fullName profilePicture")
    .sort({ score: -1, submittedAt: 1 })
    .lean();

  const grouped = new Map();

  for (const a of attempts) {
    const id = a.quiz.toString();
    if (!grouped.has(id)) grouped.set(id, []);
    grouped.get(id).push(a);
  }

  const guestIds = attempts.map((a) => a.guestId).filter(Boolean);
  const guestToUser = new Map();
  if (guestIds.length) {
    const linked = await User.find({ linkedGuestIds: { $in: guestIds } })
      .select("linkedGuestIds fullName profilePicture")
      .lean();

    for (const u of linked) {
      const gids = u.linkedGuestIds || [];
      for (const gid of gids) {
        if (guestIds.includes(gid)) guestToUser.set(gid, u);
      }
    }
  }

  const data = quizzes.map((q) => {
    const quizId = q._id.toString();

    const quizAttempts = (grouped.get(quizId) || []).map((a, index) => {
      let userObj = null;

      if (a.user) {
        userObj = a.user;
      } else if (a.guestId && guestToUser?.has(a.guestId)) {
        const mapped = guestToUser.get(a.guestId);
        userObj = {
          _id: mapped._id,
          fullName: mapped.fullName,
          profilePicture: mapped.profilePicture || "",
        };
      } else if (a.guestSnapshot) {
        userObj = {
          _id: null,
          fullName: a.guestSnapshot.fullName || "Guest",
          profilePicture: "",
        };
      } else {
        userObj = {
          _id: null,
          fullName: "Guest",
          profilePicture: "",
        };
      }

      return {
        id: a._id,
        guestId: a.guestId || null,
        user: {
          id: userObj?._id || null,
          name: userObj?.fullName || userObj?.name || "Guest",
          image: userObj?.profilePicture || userObj?.image || "",
        },
        guestSnapshot: a.guestSnapshot || null,
        score: a.score,
        totalScore: a.totalScore,
        percentage: a.percentage,
        status: mapAttemptStatus(a.status),
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
        position: index + 1,
      };
    });

    return {
      ...q,
      attempts: quizAttempts,
    };
  });

  return res.json({
    success: true,
    data,
  });
});

/**
 * =====================================================
 * GET PUBLISHED QUIZZES
 * =====================================================
 */
exports.getPublishedQuizzes = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req);
  const guestId = await resolveGuestId(req);

  let quizzes = [];

  if (userId || guestId) {
    const accessQuery = guestId ? { guestId } : userId ? { user: userId } : {};

    const accessList = await UserQuizAccess.find(accessQuery)
      .populate({
        path: "quiz",
        populate: {
          path: "createdBy",
          select: "fullName profilePicture",
        },
      })
      .sort({ accessedAt: -1 })
      .lean();

    quizzes = accessList
      .map((a) => a.quiz)
      .filter((q) => q && q.status === "PUBLISHED");

    if (userId) {
      quizzes = quizzes.filter(
        (q) => q.createdBy?._id?.toString() !== userId.toString(),
      );
    }
  }

  if (guestId) {
    const guestAttempts = await Attempt.find({ guestId, status: "SUBMITTED" })
      .populate({
        path: "quiz",
        populate: { path: "createdBy", select: "fullName profilePicture" },
      })
      .lean();

    for (const at of guestAttempts) {
      const q = at.quiz;
      if (!q || q.status !== "PUBLISHED") continue;
      if (quizzes.some((qq) => String(qq._id) === String(q._id))) continue;
      if (userId && q.createdBy?._id?.toString?.() === userId.toString())
        continue;
      quizzes.push(q);
    }
  }

  const quizIds = quizzes.map((q) => q._id);

  const attempts = await Attempt.find({
    quiz: { $in: quizIds },
  })
    .populate("user", "fullName profilePicture")
    .sort({ score: -1, submittedAt: 1 })
    .lean();

  const grouped = new Map();

  for (const a of attempts) {
    const id = a.quiz.toString();
    if (!grouped.has(id)) grouped.set(id, []);
    grouped.get(id).push(a);
  }

  const guestIds = attempts.map((a) => a.guestId).filter(Boolean);
  const guestToUser = new Map();
  if (guestIds.length) {
    const linked = await User.find({ linkedGuestIds: { $in: guestIds } })
      .select("linkedGuestIds fullName profilePicture")
      .lean();

    for (const u of linked) {
      const gids = u.linkedGuestIds || [];
      for (const gid of gids) {
        if (guestIds.includes(gid)) guestToUser.set(gid, u);
      }
    }
  }

  const data = quizzes.map((q) => {
    const rawAttempts = grouped.get(q._id.toString()) || [];

    const quizAttempts = rawAttempts.map((a, index) => {
      let userObj = null;

      if (a.user) {
        userObj = a.user;
      } else if (a.guestId && guestToUser.has(a.guestId)) {
        const mapped = guestToUser.get(a.guestId);
        userObj = {
          _id: mapped._id,
          fullName: mapped.fullName,
          profilePicture: mapped.profilePicture || "",
        };
      } else if (a.guestSnapshot) {
        userObj = {
          _id: null,
          fullName: a.guestSnapshot.fullName || "Guest",
          profilePicture: "",
        };
      } else {
        userObj = {
          _id: null,
          fullName: "Guest",
          profilePicture: "",
        };
      }

      return {
        id: a._id,
        user: {
          id: userObj?._id || null,
          name: userObj?.fullName || userObj?.name || "Guest",
          image: userObj?.profilePicture || userObj?.image || "",
        },
        guestSnapshot: a.guestSnapshot || null,
        guestId: a.guestId || null,
        score: a.score,
        totalScore: a.totalScore,
        percentage: a.percentage,
        status: a.status,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
        position: index + 1,
      };
    });

    let myRawAttempt = null;
    if (guestId) {
      myRawAttempt = rawAttempts.find((a) => a.guestId === guestId);
    } else if (userId) {
      myRawAttempt = rawAttempts.find(
        (a) => a.user?._id?.toString() === userId.toString(),
      );
    }

    return {
      ...q,
      creatorName: q.createdBy?.fullName || "",
      creatorImage: q.createdBy?.profilePicture || null,
      attempts: quizAttempts,
      myAttempt: myRawAttempt
        ? {
            ...formatAttempt(myRawAttempt),
            position:
              quizAttempts.find(
                (a) => a.id.toString() === myRawAttempt._id.toString(),
              )?.position ?? null,
          }
        : null,
    };
  });

  return res.json({
    success: true,
    data,
  });
});

/**
 * =====================================================
 * GET QUIZ BY SLUG 
 * =====================================================
 */
exports.getQuizBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const userId = resolveUserId(req);
  const guestId = await resolveGuestId(req);

  const quiz = await quizService.getQuizBySlug(slug);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
    });
  }

  if (userId || guestId) {
    if (!userId || quiz.createdBy?._id?.toString() !== userId.toString()) {
      try {
        const identityFilter = guestId
          ? { guestId, quiz: quiz._id }
          : { user: userId, quiz: quiz._id };

        const updatePayload = {
          quiz: quiz._id,
          slug,
          accessedAt: new Date(),
        };

        if (userId) {
          updatePayload.user = userId;
        }

        if (guestId) {
          updatePayload.guestId = guestId;
        }

        await UserQuizAccess.findOneAndUpdate(identityFilter, updatePayload, {
          upsert: true,
          new: true,
        });
      } catch (err) { }
    }
  }

  return res.json({
    success: true,
    data: quiz,
  });
});

/**
 * =====================================================
 * GET QUIZ 
 * =====================================================
 */
exports.getQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.getQuiz(req.params.id, req.user);

  const userId = resolveUserId(req);
  const guestId = await resolveGuestId(req);

  const attempts = await Attempt.find({
    quiz: req.params.id,
  })
    .populate("user", "fullName profilePicture")
    .sort({ score: -1, submittedAt: 1 })
    .lean();

  const guestIds = attempts.map((a) => a.guestId).filter(Boolean);
  const guestToUser = new Map();
  if (guestIds.length) {
    const linked = await User.find({ linkedGuestIds: { $in: guestIds } })
      .select("linkedGuestIds fullName profilePicture")
      .lean();

    for (const u of linked) {
      const gids = u.linkedGuestIds || [];
      for (const gid of gids) {
        if (guestIds.includes(gid)) guestToUser.set(gid, u);
      }
    }
  }

  let myAttempt = null;

  if (guestId) {
    myAttempt = await Attempt.findOne({ quiz: quiz._id, guestId }).lean();
  }

  if (!myAttempt && userId) {
    myAttempt = await Attempt.findOne({
      quiz: quiz._id,
      guestId: `user_${userId}`,
    }).lean();

    if (!myAttempt && guestToUser.size) {
      const possible = attempts.find(
        (a) => a.guestId && guestToUser.has(a.guestId),
      );
      if (possible) myAttempt = possible;
    }
  }

  const formattedAttempts = attempts.map((a, index) => {
    let userObj = null;

    if (a.user) {
      userObj = a.user;
    } else if (a.guestId && guestToUser.has(a.guestId)) {
      const mapped = guestToUser.get(a.guestId);
      userObj = {
        _id: mapped._id,
        fullName: mapped.fullName,
        profilePicture: mapped.profilePicture || "",
      };
    } else if (a.guestSnapshot) {
      userObj = {
        _id: null,
        fullName: a.guestSnapshot.fullName || "Guest",
        profilePicture: "",
      };
    } else {
      userObj = {
        _id: null,
        fullName: "Guest",
        profilePicture: "",
      };
    }

    return {
      id: a._id,
      guestId: a.guestId || null,
      user: {
        id: userObj?._id || null,
        name: userObj?.fullName || userObj?.name || "Guest",
        image: userObj?.profilePicture || userObj?.image || "",
      },
      guestSnapshot: a.guestSnapshot || null,
      score: a.score,
      totalScore: a.totalScore,
      percentage: a.percentage,
      status: mapAttemptStatus(a.status),
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
      position: index + 1,
    };
  });

  return res.json({
    success: true,
    data: {
      quiz,
      questions: quiz.questions || [],
      attempts: formattedAttempts,
      myAttempt: formatAttempt(myAttempt),
    },
  });
});

/**
 * =====================================================
 * UPDATE / DELETE / PUBLISH 
 * =====================================================
 */
exports.updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.updateQuiz(
    req.params.id,
    req.body,
    req.user.id,
  );

  await logQuizActivity({
    type: "UPDATED",
    adminId: req.user.id,
    quiz,
    fullName: req.user.fullName || "Admin",
    quizTitle: quiz?.quizName || "Untitled Quiz",
  });

  return res.json({
    success: true,
    message: "Quiz updated successfully",
    data: quiz,
  });
});

exports.deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
  })
    .select("_id quizName createdBy")
    .lean();

  await quizService.deleteQuiz(req.params.id, req.user.id);

  await logQuizActivity({
    type: "DELETED",
    adminId: req.user.id,
    quiz,
    fullName: req.user.fullName || "Admin",
    quizTitle: quiz?.quizName || "Untitled Quiz",
  });

  return res.json({
    success: true,
    message: "Quiz deleted successfully",
  });
});

exports.publishQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.publishQuiz(req.params.id, req.user.id);

  await logQuizActivity({
    type: "PUBLISHED",
    adminId: req.user.id,
    quiz,
    fullName: req.user.fullName || "Admin",
    quizTitle: quiz?.quizName || "Untitled Quiz",
  });

  return res.json({
    success: true,
    message: "Quiz published successfully",
    data: quiz,
  });
});

/**
 * =====================================================
 * START / PAUSE / RESUME / END / ARCHIVE QUIZ
 * =====================================================
 */
exports.startQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.startQuiz(req.params.id, req.user.id);

  await logQuizActivity({
    type: "STARTED",
    adminId: req.user.id,
    quiz,
    fullName: req.user.fullName || "Admin",
    quizTitle: quiz?.quizName || "Untitled Quiz",
  });

  return res.json({
    success: true,
    message: "Quiz started successfully",
    data: quiz,
  });
});

exports.pauseQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.pauseQuiz(req.params.id, req.user.id);

  return res.json({
    success: true,
    message: "Quiz paused successfully",
    data: quiz,
  });
});

exports.resumeQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.resumeQuiz(req.params.id, req.user.id);

  return res.json({
    success: true,
    message: "Quiz resumed successfully",
    data: quiz,
  });
});

exports.endQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.endQuiz(req.params.id, req.user.id);

  return res.json({
    success: true,
    message: "Quiz ended successfully",
    data: quiz,
  });
});

exports.archiveQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.archiveQuiz(req.params.id, req.user.id);

  return res.json({
    success: true,
    message: "Quiz archived successfully",
    data: quiz,
  });
});

/**
 * =====================================================
 * SUBMIT QUIZ
 * =====================================================
 */
exports.submitQuiz = asyncHandler(async (req, res) => {
  const answers = req.body?.answers?.answers ?? req.body?.answers ?? {};

  const userId = resolveUserId(req);
  const guestId = await resolveGuestId(req);

  const attempt = await attemptService.submitAttempt(
    req.params.id,
    userId,
    answers,
    guestId,
    req.user?.fullName || null,
    req.user?.email || null,
  );

  return res.json({
    success: true,
    message: "Quiz submitted successfully",
    data: formatAttempt(attempt),
  });
});

/**
 * =====================================================
 * LEADERBOARD
 * =====================================================
 */
exports.getQuizLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await leaderboardService.getQuizLeaderboard(
    req.params.id,
  );

  return res.json({
    success: true,
    data: {
      count: leaderboard.length,
      results: leaderboard,
    },
  });
});