"use strict";

const asyncHandler = require("../utils/asyncHandler");
const analyticsService = require("../services/analytics");
const authService = require("../services/auth");

/**
 * =====================================================
 * SAFE RESPONSE HELPERS
 * =====================================================
 * =====================================================
 */
const sendSuccess = (res, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

const sendFail = (res, message = "Request failed", status = 400) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

/**
 * =====================================================
 * RESOLVE IDENTITY (GUEST-FIRST RULE)
 * =====================================================
 * IMPORTANT:
 * - guestId is the primary identity for analytics
 * - userId remains metadata only
 */
const resolveIdentity = async (req) => {
  const user = req.user || {};

  const rawGuestId = user.guestId || null;

  const guestId = rawGuestId
    ? await authService.resolvePrimaryGuestId(rawGuestId)
    : null;

  const userId = user.id || null;

  return { guestId, userId };
};

/**
 * =====================================================
 * ADMIN ANALYTICS
 * =====================================================
 */
exports.getAdminAnalytics = asyncHandler(async (req, res) => {
  const adminId = req.user?.id;

  if (!adminId) {
    return sendFail(res, "Unauthorized", 401);
  }

  const data = await analyticsService.getAdminAnalytics(adminId);

  return sendSuccess(res, data || {});
});

/**
 * =====================================================
 * USER ANALYTICS (FIXED FOR YOUR SERVICE)
 * =====================================================
 * 🔥 CRITICAL FIX:
 * - Your service ONLY supports getUserAnalytics(userId)
 * - So we NEVER call missing functions
 * - We NEVER pass guestId into service
 */
exports.getUserAnalytics = asyncHandler(async (req, res) => {
  const { userId, guestId } = await resolveIdentity(req);

  /**
   * No identity at all
   */
  if (!userId && !guestId) {
    return sendFail(res, "Unauthorized - missing identity", 401);
  }

  const data = await analyticsService.getUserAnalytics(userId, guestId);

  return sendSuccess(res, data || {});
});

exports.getQuizAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const quizId = req.params?.id;

  if (!userId) {
    return sendFail(res, "Unauthorized", 401);
  }

  if (!quizId) {
    return sendFail(res, "Quiz id is required", 400);
  }

  const data = await analyticsService.getQuizAnalytics(userId, quizId);

  return sendSuccess(res, data || {});
});
