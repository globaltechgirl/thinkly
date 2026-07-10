"use strict";

const mongoose = require("mongoose");
const { Attempt, ATTEMPT_STATES } = require("../models/attempt");

/**
 * =====================================================
 * SAFE OBJECTID VALIDATION
 * =====================================================
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * =====================================================
 * NORMALIZE USER DISPLAY (CRITICAL GUEST FIX)
 * =====================================================
 * Ensures guest users NEVER leak into user aggregation logic.
 */
const normalizeUser = (userDoc, attempt) => {
  if (userDoc && userDoc._id) {
    return {
      _id: userDoc._id,
      fullName: userDoc.fullName || "User",
      profilePicture: userDoc.profilePicture || "",
      role: userDoc.role || "user",
      type: "user",
    };
  }

  /**
   * Guest fallback (CRITICAL FIX)
   */
  return {
    _id: null,
    fullName: attempt?.guestSnapshot?.fullName || "Guest",
    profilePicture: "",
    role: "guest",
    type: "guest",
    guestId: attempt?.guestId || null,
  };
};

/**
 * =====================================================
 * GET QUIZ LEADERBOARD (PRODUCTION SAFE + IDENTITY FIXED)
 * =====================================================
 */
exports.getQuizLeaderboard = async (quizId, { limit = 100 } = {}) => {
  try {
    if (!quizId || !isValidObjectId(quizId)) {
      throw new Error("Invalid quiz ID");
    }

    const objectId = new mongoose.Types.ObjectId(quizId);

    const pipeline = [
      /**
       * =================================================
       * ONLY COMPLETED ATTEMPTS
       * =================================================
       */
      {
        $match: {
          quiz: objectId,
          status: ATTEMPT_STATES.SUBMITTED,
          guestId: { $exists: true, $ne: null },
        },
      },

      /**
       * =================================================
       * STABLE RANKING SORT
       * =================================================
       */
      {
        $sort: {
          score: -1,
          timeTakenSeconds: 1,
          submittedAt: 1,
        },
      },

      /**
       * =================================================
       * GROUP BY GUEST ID (PRIMARY IDENTITY)
       * =================================================
       */
      {
        $group: {
          _id: "$guestId",
          attempt: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$attempt" },
      },

      /**
       * =================================================
       * USER JOIN (SAFE)
       * =================================================
       */
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      /**
       * =================================================
       * WINDOW RANKING
       * =================================================
       */
      {
        $setWindowFields: {
          sortBy: {
            score: -1,
            timeTakenSeconds: 1,
            submittedAt: 1,
          },
          output: {
            position: { $rank: {} },
          },
        },
      },

      /**
       * =================================================
       * FINAL SHAPE (FIXED IDENTITY MODEL)
       * =================================================
       */
      {
        $project: {
          _id: 1,
          quiz: 1,

          score: 1,
          totalScore: 1,
          percentage: 1,
          timeTakenSeconds: 1,
          submittedAt: 1,
          position: 1,

          /**
           * RAW USER (may be null for guests)
           */
          user: "$user",

          /**
           * GUEST DATA PRESERVED (CRITICAL FIX)
           */
          guestId: 1,
          guestSnapshot: 1,

          /**
           * IDENTITY TYPE FLAG
           */
          isGuest: {
            $cond: [{ $ifNull: ["$user._id", false] }, false, true],
          },
        },
      },

      /**
       * =================================================
       * LIMIT
       * =================================================
       */
      {
        $limit: Math.max(1, Math.min(limit, 200)),
      },
    ];

    const results = await Attempt.aggregate(pipeline).allowDiskUse(true);

    /**
     * =====================================================
     * POST PROCESS (SAFE NORMALIZATION)
     * =====================================================
     */
    return (results || []).map((r) => ({
      _id: r._id,
      quiz: r.quiz,

      score: r.score,
      totalScore: r.totalScore,
      percentage: r.percentage,
      timeTakenSeconds: r.timeTakenSeconds,
      submittedAt: r.submittedAt,
      position: r.position,

      isGuest: r.isGuest,

      user: normalizeUser(r.user, r),
    }));
  } catch (error) {
    console.error("Leaderboard aggregation error:", {
      message: error.message,
      stack: error.stack,
    });

    throw new Error("Failed to load leaderboard");
  }
};
