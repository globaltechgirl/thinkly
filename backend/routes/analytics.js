"use strict";

const express = require("express");
const router = express.Router();

/**
 * =====================================================
 * CONTROLLERS
 * =====================================================
 */
const {
  getAdminAnalytics,
  getUserAnalytics,
} = require("../controllers/analyticsController");

/**
 * =====================================================
 * MIDDLEWARE
 * =====================================================
 */
const { protect, authorizeRoles } = require("../middleware/auth");

/**
 * =====================================================
 * SAFE ASYNC WRAPPER
 * =====================================================
 */
const safeAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * =====================================================
 * IDENTITY NORMALIZATION (GUEST-FIRST SYSTEM RULE)
 * =====================================================
 * CRITICAL RULE:
 * - guestId ALWAYS takes priority over userId
 * - ensures persistent history across login/register
 */
const attachIdentity = (req, _res, next) => {
  const userId = req.user?.id || null;
  const guestId = req.user?.guestId || null;

  req.identity = {
    userId,
    guestId,
  };

  next();
};

/**
 * =====================================================
 * USER ANALYTICS
 * =====================================================
 * @route GET /api/analytics/user
 */
router.get(
  "/user",
  protect,
  attachIdentity,
  safeAsync(async (req, res) => {
    const { userId, guestId } = req.identity || {};

    const identityId = guestId || userId;

    if (!identityId) {
      return res.status(400).json({
        success: false,
        message: "Identity required (guestId or userId missing)",
      });
    }

    /**
     * IMPORTANT FIX:
     * NEVER pass identityId manually to controller.
     * Controller MUST use req object only.
     */
    return getUserAnalytics(req, res);
  }),
);

router.get(
  "/quiz/:id",
  protect,
  attachIdentity,
  safeAsync(async (req, res) => {
    return getQuizAnalytics(req, res);
  }),
);

/**
 * =====================================================
 * ADMIN ANALYTICS
 * =====================================================
 * @route GET /api/analytics/admin
 */
router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  attachIdentity,
  safeAsync(async (req, res) => {
    return getAdminAnalytics(req, res);
  }),
);

module.exports = router;
