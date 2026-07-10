"use strict";

const express = require("express");
const router = express.Router();

/**
 * =====================================================
 * CONTROLLERS
 * =====================================================
 */
const { getQuizBySlug } = require("../controllers/quizController");

/**
 * =====================================================
 * MIDDLEWARE
 * =====================================================
 */
const { optionalAuth } = require("../middleware/auth");

/**
 * =====================================================
 * SAFE ASYNC WRAPPER
 * =====================================================
 */
const safeAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * =====================================================
 * VALIDATION HELPERS
 * =====================================================
 */
const isValidSlug = (slug) =>
  typeof slug === "string" &&
  slug.trim().length >= 3 &&
  slug.trim().length <= 120;

/**
 * =====================================================
 * IDENTITY PERSISTENCE (CRITICAL FIX)
 * =====================================================
 * Ensures guestId is consistent across ALL play components
 * so history + attempts are correctly tied to one identity.
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
 * ROUTES
 * =====================================================
 */

/**
 * @route   GET /api/play/:slug
 * @desc    Public access to quiz via slug (guest + user)
 * @access  Public
 *
 * FIX APPLIED:
 * - guestId is now captured and persists across play flow
 * - ensures consistent identity for attempt history tracking
 */
router.get(
  "/:slug",
  optionalAuth,
  attachIdentity,
  (req, res, next) => {
    const { slug } = req.params;

    if (!isValidSlug(slug)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz slug",
      });
    }

    next();
  },
  safeAsync((req, res) => {
    return getQuizBySlug(
      {
        ...req,
        userId: req.identity?.userId,
        guestId: req.identity?.guestId,
      },
      res,
    );
  }),
);

module.exports = router;
