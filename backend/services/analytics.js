"use strict";

const mongoose = require("mongoose");
const Quiz = require("../models/quiz");
const { Attempt } = require("../models/attempt");
const ActivityLog = require("../models/activity");
const UserQuizAccess = require("../models/userquiz");

const toObjectId = (id) => {
  if (!id) return null;

  if (id instanceof mongoose.Types.ObjectId) return id;

  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }

  return null;
};

const buildGuestMatch = (userObjectId, guestId) => {
  const matches = [];

  if (guestId) {
    matches.push({ guestId: String(guestId) });
  }

  if (userObjectId) {
    matches.push({ guestId: `user_${userObjectId}` });
  }

  if (matches.length === 0) {
    return {};
  }

  return matches.length === 1 ? matches[0] : { $or: matches };
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const toMonthLabel = ({ year, month }) => ({
  monthName: `${monthNames[month - 1] || ""} ${year}`,
  year,
  month,
});

const toMonthlySeries = (items = []) =>
  items
    .map((item) => ({
      ...toMonthLabel(item._id || item),
      total: item.total || 0,
    }))
    .sort((a, b) => a.year - b.year || a.month - b.month);

const getUserPublishedQuizzes = async (userObjectId, guestId) => {
  const accessQuery = guestId
    ? { guestId }
    : userObjectId
    ? { user: userObjectId }
    : {};

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

  const quizMap = new Map();
  (accessList || [])
    .map((access) => access.quiz)
    .filter((quiz) => quiz && quiz.status === "PUBLISHED")
    .forEach((quiz) => {
      const id = String(quiz._id);
      if (!quizMap.has(id)) {
        quizMap.set(id, quiz);
      }
    });

  if (guestId) {
    const guestAttempts = await Attempt.find({
      guestId,
      status: "SUBMITTED",
    })
      .populate({
        path: "quiz",
        populate: {
          path: "createdBy",
          select: "fullName profilePicture",
        },
      })
      .lean();

    for (const attempt of guestAttempts || []) {
      const quiz = attempt.quiz;
      if (!quiz || quiz.status !== "PUBLISHED") continue;

      const quizId = String(quiz._id);
      if (quizMap.has(quizId)) continue;
      if (userObjectId && String(quiz.createdBy?._id) === String(userObjectId))
        continue;

      quizMap.set(quizId, quiz);
    }
  }

  return Array.from(quizMap.values());
};

const buildAnalyticsChecklist = (payload = {}) => ({
  admin: {
    grids: {
      totalQuizzesPerMonth: (payload.monthlyQuizzes || []).length > 0,
      activeQuizzesPerMonth: (payload.monthlyActiveQuizzes || []).length > 0,
      totalParticipantsPerMonth: (payload.monthlyParticipants || []).length > 0,
      totalSubmissionsPerMonth: (payload.monthlySubmissions || []).length > 0,
    },
    bars: {
      monthlyParticipantsSubmissions:
        (payload.monthlySubmissions || []).length > 0,
    },
    lists: {
      participants:
        Array.isArray(payload.participantList) &&
        payload.participantList.length > 0,
    },
    notifications: {
      adminNotifications:
        Array.isArray(payload.notifications) &&
        payload.notifications.length > 0,
    },
  },
  user: {
    grids: {
      totalAttemptsPerMonth: (payload.monthlyAttempts || []).length > 0,
      totalQuizzesPerMonth: (payload.monthlyQuizzes || []).length > 0,
      pendingQuizzesPerMonth: (payload.monthlyPendingQuizzes || []).length > 0,
      wonQuizzesPerMonth: (payload.monthlyWonQuizzes || []).length > 0,
    },
    bars: {
      monthlyActivities: (payload.monthlyActivities || []).length > 0,
    },
    notifications: {
      userNotifications:
        Array.isArray(payload.notifications) &&
        payload.notifications.length > 0,
    },
  },
});

/**
 * =====================================================
 * ADMIN ANALYTICS
 * =====================================================
 */
exports.getAdminAnalytics = async (adminId) => {
  const adminObjectId = toObjectId(adminId);

  if (!adminObjectId) {
    throw new Error("Invalid admin ID");
  }

  const quizzes = await Quiz.find({ createdBy: adminObjectId })
    .select("_id quizName status createdAt updatedAt")
    .lean();

  const quizIds = quizzes.map((q) => q._id).filter(Boolean);

  if (!quizIds.length) {
    const emptyPayload = {
      totalCreated: 0,
      totalActive: 0,
      totalParticipants: 0,
      totalSubmissions: 0,
      monthlySubmissions: [],
      monthlyQuizzes: [],
      monthlyActiveQuizzes: [],
      monthlyParticipants: [],
      participantList: [],
      notifications: [],
      activityTimeline: [],
      analyticsChecklist: buildAnalyticsChecklist({}),
    };
    
    return emptyPayload;
  }

  const [
    totalCreated,
    totalActive,
    totalParticipantsAgg,
    totalSubmissions,
    monthlySubmissions,
    monthlyCreatedQuizzes,
    monthlyActiveQuizzes,
    monthlyParticipants,
    activityLogs,
    participantAttempts,
  ] = await Promise.all([
    Quiz.countDocuments({ createdBy: adminObjectId }),

    Quiz.countDocuments({
      createdBy: adminObjectId,
      status: "PUBLISHED",
      runtimeStatus: "ACTIVE",
    }),

    Attempt.aggregate([
      {
        $match: {
          quiz: { $in: quizIds },
          status: "SUBMITTED",
          guestId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            /**
             * CRITICAL FIX: primary participant identity must be guestId
             */
            participantId: "$guestId",
          },
        },
      },
      { $count: "total" },
    ]),

    Attempt.countDocuments({
      quiz: { $in: quizIds },
      status: "SUBMITTED",
    }),

    Attempt.aggregate([
      {
        $match: {
          quiz: { $in: quizIds },
          status: "SUBMITTED",
          submittedAt: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$submittedAt" },
            month: { $month: "$submittedAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    Quiz.aggregate([
      {
        $match: {
          createdBy: adminObjectId,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    Quiz.aggregate([
      {
        $match: {
          createdBy: adminObjectId,
          status: "PUBLISHED",
          runtimeStatus: "ACTIVE",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    Attempt.aggregate([
      {
        $match: {
          quiz: { $in: quizIds },
          status: "SUBMITTED",
          submittedAt: { $exists: true, $ne: null },
          guestId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$submittedAt" },
            month: { $month: "$submittedAt" },
          },
          participants: {
            $addToSet: "$guestId",
          },
        },
      },
      {
        $project: {
          _id: 1,
          total: { $size: "$participants" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    ActivityLog.aggregate([
      {
        $match: {
          admin: adminObjectId,
          type: {
            $in: ["STARTED", "SUBMITTED", "UPDATED", "PUBLISHED", "DELETED"],
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Africa/Lagos",
            },
          },
          time: "$createdAt",
          type: 1,
          message: 1,
        },
      },
      {
        $group: {
          _id: "$date",
          activities: { $push: "$$ROOT" },

          started: { $sum: { $cond: [{ $eq: ["$type", "STARTED"] }, 1, 0] } },
          submitted: {
            $sum: { $cond: [{ $eq: ["$type", "SUBMITTED"] }, 1, 0] },
          },
          updated: { $sum: { $cond: [{ $eq: ["$type", "UPDATED"] }, 1, 0] } },
          published: {
            $sum: { $cond: [{ $eq: ["$type", "PUBLISHED"] }, 1, 0] },
          },
          deleted: { $sum: { $cond: [{ $eq: ["$type", "DELETED"] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          activities: 1,
          total: {
            $add: [
              "$started",
              "$submitted",
              "$updated",
              "$published",
              "$deleted",
            ],
          },
        },
      },
      { $sort: { date: -1 } },
    ]),

    Attempt.find({
      quiz: { $in: quizIds },
      status: { $in: ["SUBMITTED", "IN_PROGRESS"] },
    })
      .populate("user", "fullName profilePicture")
      .populate("quiz", "quizName")
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean(),
  ]);

  const participantRanks = await Attempt.aggregate([
    {
      $match: {
        quiz: { $in: quizIds },
        status: "SUBMITTED",
        leaderboardScore: { $exists: true, $ne: null },
      },
    },
    {
      $sort: {
        leaderboardScore: -1,
        submittedAt: 1,
        _id: 1,
      },
    },
    {
      $group: {
        _id: "$quiz",
        ranked: {
          $push: {
            id: "$_id",
            score: "$leaderboardScore",
          },
        },
      },
    },
  ]);

  const positionMap = new Map();

  participantRanks.forEach((group) => {
    (group.ranked || []).forEach((entry, index) => {
      positionMap.set(String(entry.id), index + 1);
    });
  });

  const uniqueParticipants = new Map();

  (participantAttempts || []).forEach((attempt) => {
    const participantId = attempt.guestId || null;

    if (participantId && !uniqueParticipants.has(participantId)) {
      uniqueParticipants.set(participantId, attempt);
    }
  });

  const participantList = Array.from(uniqueParticipants.values()).map(
    (attempt) => ({
      id: attempt.guestId,
      guestId: attempt.guestId || null,
      userName:
        attempt.user?.fullName ||
        attempt.guestSnapshot?.fullName ||
        "Guest User",
      avatar: attempt.user?.profilePicture || null,
      quizName: attempt.quiz?.quizName || "Unknown Quiz",
      status: String(attempt.status || "IN_PROGRESS").toLowerCase(),
      score: attempt.score || 0,
      position: positionMap.get(String(attempt._id)) || null,
      responsesSubmitted: Object.keys(attempt.answers || {}).length,
      submittedAt: attempt.submittedAt || null,
    }),
  );

  const activityNotifications = (activityLogs || [])
    .flatMap((entry) =>
      (entry.activities || []).map((activity) => {
        const activityTime = activity.time || activity.createdAt || null;
        const activityDate = activityTime ? new Date(activityTime) : new Date();

        return {
          title: String(activity.type || "").toLowerCase(),
          text:
            activity.message ||
            `${activity.userName || "A user"} ${String(activity.type || "activity").toLowerCase()} ${activity.quizName || "this quiz"}`,
          time: activityTime,
          month: `${monthNames[activityDate.getMonth()] || ""} ${activityDate.getFullYear()}`,
        };
      }),
    )
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));

  const fallbackNotificationsByGuest = new Map();

  (participantAttempts || [])
    .filter((attempt) => attempt?.status === "SUBMITTED" && attempt.guestId)
    .forEach((attempt) => {
      const notification = {
        guestId: attempt.guestId,
        title: "submitted",
        text: `${attempt.guestSnapshot?.fullName || attempt.user?.fullName || "A user"} submitted ${attempt.quiz?.quizName || "this quiz"}`,
        time: attempt.submittedAt || attempt.createdAt || null,
        month: attempt.submittedAt
          ? `${monthNames[new Date(attempt.submittedAt).getMonth()] || ""} ${new Date(attempt.submittedAt).getFullYear()}`
          : null,
      };

      const existing = fallbackNotificationsByGuest.get(attempt.guestId);
      if (
        !existing ||
        new Date(notification.time || 0) > new Date(existing.time || 0)
      ) {
        fallbackNotificationsByGuest.set(attempt.guestId, notification);
      }
    });

  const fallbackNotifications = Array.from(
    fallbackNotificationsByGuest.values(),
  )
    .concat(
      (quizzes || [])
        .filter((quiz) => quiz?.status === "PUBLISHED")
        .map((quiz) => ({
          title: "published",
          text: `${quiz.quizName || "This quiz"} was published`,
          time: quiz.updatedAt || quiz.createdAt || null,
          month:
            quiz.updatedAt || quiz.createdAt
              ? `${monthNames[new Date(quiz.updatedAt || quiz.createdAt).getMonth()] || ""} ${new Date(quiz.updatedAt || quiz.createdAt).getFullYear()}`
              : null,
        })),
    )
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));

  const notifications = (
    activityNotifications.length ? activityNotifications : fallbackNotifications
  ).slice(0, 25);

  const payload = {
    totalCreated: totalCreated || 0,
    totalActive: totalActive || 0,
    totalParticipants: totalParticipantsAgg?.[0]?.total || 0,
    totalSubmissions: totalSubmissions || 0,
    monthlySubmissions: monthlySubmissions || [],
    monthlyQuizzes: toMonthlySeries(monthlyCreatedQuizzes),
    monthlyActiveQuizzes: toMonthlySeries(monthlyActiveQuizzes),
    monthlyParticipants: toMonthlySeries(monthlyParticipants),
    participantList,
    notifications,
    activityTimeline: activityLogs || [],
    analyticsChecklist: buildAnalyticsChecklist({
      monthlyQuizzes: toMonthlySeries(monthlyCreatedQuizzes),
      monthlyActiveQuizzes: toMonthlySeries(monthlyActiveQuizzes),
      monthlyParticipants: toMonthlySeries(monthlyParticipants),
      monthlySubmissions,
      participantList,
      notifications,
    }),
  };
  return payload;
};

exports.getUserAnalytics = async (userId, guestId = null) => {
  const userObjectId = toObjectId(userId);

  const identityQuery = buildGuestMatch(userObjectId, guestId);

  if (Object.keys(identityQuery).length === 0) {
    throw new Error("Invalid identity for analytics");
  }

  const publishedQuizzes = await getUserPublishedQuizzes(
    userObjectId,
    guestId,
  );
  const publishedQuizIds = publishedQuizzes
    .map((quiz) => quiz._id)
    .filter(Boolean);

  if (!publishedQuizIds.length) {
    return {
      totalQuizzes: 0,
      totalActiveQuizzes: 0,
      totalAttempts: 0,
      totalPendingQuizzes: 0,
      totalWonQuizzes: 0,
      monthlyAttempts: [],
      monthlyQuizzes: [],
      monthlyPendingQuizzes: [],
      monthlyWonQuizzes: [],
      monthlyActivities: [],
      dailyActivities: [],
      activityFeed: [],
      notifications: [],
      analyticsChecklist: buildAnalyticsChecklist({}),
    };
  }

  const attempts = await Attempt.find({
    ...identityQuery,
    quiz: { $in: publishedQuizIds },
  })
    .select("quiz status score guestId user submittedAt answers")
    .populate("quiz", "quizName questions")
    .lean();

  const submittedAttempts = attempts.filter(
    (a) => String(a.status).toUpperCase() === "SUBMITTED",
  );

  const submittedQuizIds = new Set(
    submittedAttempts
      .map((a) => String(a.quiz?._id ?? a.quiz))
      .filter(Boolean),
  );

  const attemptPositionMap = new Map();
  [...submittedAttempts]
    .sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      const dateA = a.submittedAt ? new Date(a.submittedAt) : new Date(0);
      const dateB = b.submittedAt ? new Date(b.submittedAt) : new Date(0);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      return String(a._id).localeCompare(String(b._id));
    })
    .forEach((attempt, index) => {
      attemptPositionMap.set(String(attempt._id), index + 1);
    });

  const globalMaxScores = await Attempt.aggregate([
    {
      $match: {
        status: "SUBMITTED",
        score: { $ne: null },
        quiz: { $in: publishedQuizIds },
      },
    },
    {
      $group: {
        _id: "$quiz",
        maxScore: { $max: "$score" },
      },
    },
  ]);

  const maxScoreMap = new Map(
    globalMaxScores.map((i) => [String(i._id), i.maxScore || 0]),
  );

  let totalWonQuizzes = 0;

  submittedQuizIds.forEach((quizId) => {
    const userBest = Math.max(
      ...submittedAttempts
        .filter((a) => String(a.quiz?._id ?? a.quiz) === quizId)
        .map((a) => a.score || 0),
    );

    const globalBest = maxScoreMap.get(quizId);

    if (globalBest !== undefined && userBest === globalBest) {
      totalWonQuizzes += 1;
    }
  });

  const activeQuizzes = publishedQuizzes.filter(
    (quiz) => quiz.runtimeStatus === "ACTIVE",
  );

  const [
    activityTimeline,
    activityFeed,
    attemptsMonthly,
    quizzesMonthly,
    activityBars,
  ] = await Promise.all([
    ActivityLog.aggregate([
      {
        $match: {
          ...identityQuery,
          quiz: { $in: publishedQuizIds },
        },
      },
      {
        $match: {
          type: { $in: ["STARTED", "SUBMITTED"] },
        },
      },
      {
        $addFields: {
          day: {
            $dateTrunc: {
              date: "$createdAt",
              unit: "day",
              timezone: "Africa/Lagos",
            },
          },
        },
      },
      {
        $group: {
          _id: "$day",
          started: { $sum: { $cond: [{ $eq: ["$type", "STARTED"] }, 1, 0] } },
          submitted: {
            $sum: { $cond: [{ $eq: ["$type", "SUBMITTED"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$_id",
              timezone: "Africa/Lagos",
            },
          },
          started: 1,
          submitted: 1,
          total: 1,
        },
      },
      { $sort: { date: 1 } },
    ]),

    ActivityLog.aggregate([
      {
        $match: {
          ...identityQuery,
          quiz: { $in: publishedQuizIds },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $project: {
          _id: 1,
          quizTitle: { $ifNull: ["$meta.quizTitle", "$message"] },
          startTime: "$createdAt",
          endTime: "$createdAt",
          timeRange: null,
          adminName: { $ifNull: ["$meta.fullName", ""] },
          adminAvatar: null,
          createdAt: 1,
        },
      },
    ]),

    Attempt.aggregate([
      {
        $match: {
          status: "SUBMITTED",
          ...identityQuery,
          quiz: { $in: publishedQuizIds },
          submittedAt: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$submittedAt" },
            month: { $month: "$submittedAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    Quiz.aggregate([
      {
        $match: {
          _id: { $in: publishedQuizIds },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    ActivityLog.aggregate([
      {
        $match: {
          ...identityQuery,
          quiz: { $in: publishedQuizIds },
        },
      },
      {
        $match: {
          type: { $in: ["STARTED", "SUBMITTED"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  const fallbackActivityFeed = (publishedQuizzes || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50)
    .map((item) => ({
      _id: item._id,
      quizTitle: item.quizName || "Untitled Quiz",
      startTime: item.createdAt || null,
      endTime: item.createdAt || null,
      timeRange: null,
      adminName: item.createdBy?.fullName || "Unknown Admin",
      adminAvatar: item.createdBy?.profilePicture || null,
      createdAt: item.createdAt || null,
    }));

  const activeQuizIds = new Set(activeQuizzes.map((q) => String(q._id)));

  const pendingMonthlyMap = new Map();
  activeQuizzes
    .filter((quiz) => !submittedQuizIds.has(String(quiz._id)))
    .forEach((quiz) => {
      const createdAt = quiz.createdAt ? new Date(quiz.createdAt) : new Date();
      const key = `${createdAt.getFullYear()}-${String(
        createdAt.getMonth() + 1,
      ).padStart(2, "0")}`;
      pendingMonthlyMap.set(key, (pendingMonthlyMap.get(key) || 0) + 1);
    });

  const pendingMonthly = Array.from(pendingMonthlyMap.entries())
    .map(([key, total]) => {
      const [year, month] = key.split("-").map(Number);
      return { _id: { year, month }, total };
    })
    .sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month);

  const wonMonthlyMap = new Map();

  submittedAttempts.forEach((attempt) => {
    const globalBest = maxScoreMap.get(String(attempt.quiz));

    if (
      globalBest !== undefined &&
      Number(attempt.score || 0) === Number(globalBest)
    ) {
      const createdAt = attempt.submittedAt
        ? new Date(attempt.submittedAt)
        : new Date();
      const key = `${createdAt.getFullYear()}-${String(
        createdAt.getMonth() + 1,
      ).padStart(2, "0")}`;
      wonMonthlyMap.set(key, (wonMonthlyMap.get(key) || 0) + 1);
    }
  });

  const wonMonthly = Array.from(wonMonthlyMap.entries())
    .map(([key, total]) => {
      const [year, month] = key.split("-").map(Number);
      return { _id: { year, month }, total };
    })
    .sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month);

  const totalPendingQuizzes = [...activeQuizIds].filter(
    (id) => !submittedQuizIds.has(id),
  ).length;

  const totalAttempts = submittedAttempts.length;

  const resolvedActivityFeed =
    (activityFeed || []).length > 0 ? activityFeed : fallbackActivityFeed;

  const activityNotifications = (resolvedActivityFeed || [])
    .map((item) => ({
      quizName: item.quizTitle || "Quiz",
      quizStartTime: item.startTime || null,
      quizEndTime: item.endTime || null,
      attemptScore: item.attemptScore ?? null,
      attemptPosition: item.attemptPosition ?? null,
      attemptSubmittedAt: item.attemptSubmittedAt || item.createdAt || null,
      month: item.createdAt
        ? `${monthNames[new Date(item.createdAt).getMonth()] || ""}`
        : null,
      year: item.createdAt ? new Date(item.createdAt).getFullYear() : null,
    }))
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));

  const fallbackAttemptNotifications = submittedAttempts
    .filter((attempt) => attempt.submittedAt)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 25)
    .map((attempt) => ({
      quizName: attempt.quiz?.quizName || "Quiz submitted",
      quizStartTime: attempt.submittedAt,
      quizEndTime: attempt.submittedAt,
      attemptScore: attempt.score ?? null,
      attemptPosition: attemptPositionMap.get(String(attempt._id)) || null,
      attemptSubmittedAt: attempt.submittedAt,
      attemptResponses:
        attempt.quiz?.questions?.length ??
        Object.keys(attempt.answers || {}).length,
      responsesSubmitted: Object.keys(attempt.answers || {}).length,
      month: attempt.submittedAt
        ? `${monthNames[new Date(attempt.submittedAt).getMonth()] || ""}`
        : null,
      year: attempt.submittedAt
        ? new Date(attempt.submittedAt).getFullYear()
        : null,
    }));

  const notifications = fallbackAttemptNotifications;

  const payload = {
    totalQuizzes: publishedQuizzes.length || 0,
    totalActiveQuizzes: activeQuizzes.length || 0,
    totalAttempts,
    totalPendingQuizzes,
    totalWonQuizzes: totalWonQuizzes || 0,
    monthlyAttempts: toMonthlySeries(attemptsMonthly),
    monthlyQuizzes: toMonthlySeries(quizzesMonthly),
    monthlyPendingQuizzes: toMonthlySeries(pendingMonthly),
    monthlyWonQuizzes: toMonthlySeries(wonMonthly),
    monthlyActivities: toMonthlySeries(activityBars),
    dailyActivities: activityTimeline || [],
    activityFeed: resolvedActivityFeed || [],
    notifications,
    analyticsChecklist: buildAnalyticsChecklist({
      monthlyAttempts: attemptsMonthly,
      monthlyQuizzes: quizzesMonthly,
      monthlyPendingQuizzes: pendingMonthly,
      monthlyWonQuizzes: wonMonthly,
      monthlyActivities: activityBars,
      notifications,
    }),
  };

  return payload;
};

exports.getQuizAnalytics = async (userId, quizId) => {
  const userObjectId = toObjectId(userId);
  const quizObjectId = toObjectId(quizId);

  if (!userObjectId) {
    throw new Error("Invalid user identity");
  }

  if (!quizObjectId) {
    throw new Error("Invalid quiz id");
  }

  const quiz = await Quiz.findOne({
    _id: quizObjectId,
    createdBy: userObjectId,
    status: "PUBLISHED",
  }).lean();

  if (!quiz) {
    throw new Error("Quiz not found or access denied");
  }

  const attempts = await Attempt.find({
    quiz: quizObjectId,
    status: "SUBMITTED",
  })
    .populate("user", "fullName profilePicture")
    .sort({ score: -1, submittedAt: 1 })
    .lean();

  const totalAttempts = attempts.length;
  const averageScore =
    totalAttempts === 0
      ? 0
      : attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) /
        totalAttempts;

  const topParticipants = attempts.map((attempt, index) => ({
    id: attempt.user?._id || attempt.guestId || null,
    name: attempt.user?.fullName || attempt.guestSnapshot?.fullName || "Guest",
    image: attempt.user?.profilePicture || "",
    score: attempt.score || 0,
    totalScore: attempt.totalScore || 0,
    percentage: attempt.percentage || 0,
    position: index + 1,
    submittedAt: attempt.submittedAt,
    status: attempt.status,
  }));

  return {
    quiz: {
      id: String(quiz._id),
      name: quiz.quizName,
      slug: quiz.slug,
    },
    totalAttempts,
    averageScore,
    topParticipants,
  };
};
