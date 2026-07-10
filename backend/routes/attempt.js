"use strict";

const express = require("express");
const router = express.Router();

/**
 * =====================================================
 * CONTROLLERS
 * =====================================================
 */
const attemptController = require("../controllers/attemptController");

/**
 * =====================================================
 * MIDDLEWARE
 * =====================================================
 */
const { protect, authorizeRoles } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");

const {
  quizIdValidator,
  attemptIdValidator,
} = require("../validators/quiz");

/**
 * =====================================================
 * SAFE ASYNC WRAPPER
 * =====================================================
 */
const safeAsync = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * =====================================================
 * GLOBAL AUTH PROTECTION
 * =====================================================
 */
router.use(protect);

/**
 * =====================================================
 * SUBMIT ATTEMPT
 * =====================================================
 */
router.post(
  "/quiz/:quizId",
  quizIdValidator,
  validateRequest,
  safeAsync(async (req, res, next) => {
    const result = await attemptController.submitAttempt(req, res, next);

    return result;
  })
);

/**
 * =====================================================
 * GET MY ATTEMPTS
 * =====================================================
 */
router.get(
  "/me",
  safeAsync(async (req, res, next) => {
    const result = await attemptController.getMyAttempts(req, res, next);

    return result;
  })
);

/**
 * =====================================================
 * GET QUIZ ATTEMPTS (OWNER ONLY)
 * =====================================================
 */
router.get(
  "/quiz/:quizId/all",
  quizIdValidator,
  validateRequest,
  safeAsync(async (req, res, next) => {
    const result = await attemptController.getQuizAttempts(req, res, next);

    return result;
  })
);

/**
 * =====================================================
 * GET SINGLE ATTEMPT
 * =====================================================
 */
router.get(
  "/:attemptId",
  attemptIdValidator,
  validateRequest,
  safeAsync(async (req, res, next) => {
    const result = await attemptController.getAttemptById(req, res, next);

    return result;
  })
);

/**
 * =====================================================
 * GET ATTEMPT SUMMARY
 * =====================================================
 */
router.get(
  "/:attemptId/summary",
  attemptIdValidator,
  validateRequest,
  safeAsync(async (req, res, next) => {
    const result = await attemptController.getMyAttemptSummary(req, res, next);

    return result;
  })
);

/**
 * =====================================================
 * DELETE ATTEMPT
 * =====================================================
 */
router.delete(
  "/:attemptId",
  attemptIdValidator,
  validateRequest,
  safeAsync(async (req, res, next) => {
    const result = await attemptController.deleteAttempt(req, res, next);

    return result;
  })
);

/**
 * =====================================================
 * ADMIN - GET ALL ATTEMPTS
 * =====================================================
 */
router.get(
  "/admin/all",
  authorizeRoles("admin"),
  safeAsync(async (req, res, next) => {
    const result = await attemptController.getAdminAllAttempts(req, res, next);

    return result;
  })
);

module.exports = router;