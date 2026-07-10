const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

const {
  register,
  login,
  getMe,
  createGuestSession,
  logout,
} = require("../controllers/authController");

const { protect, optionalAuth } = require("../middleware/auth");

/**
 * =====================================================
 * VALIDATION HANDLER
 * =====================================================
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      requestId: req.requestId,
    });
  }

  next();
};

/**
 * =====================================================
 * COMMON VALIDATORS
 * =====================================================
 */
const emailValidator = body("email")
  .trim()
  .isEmail()
  .withMessage("Valid email required")
  .normalizeEmail();

const passwordValidator = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[A-Za-z]/)
  .withMessage("Password must contain at least one letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number");

/**
 * =====================================================
 * GUEST VALIDATION
 * =====================================================
 */
const guestValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be 2–50 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email required")
    .normalizeEmail(),
];

/**
 * =====================================================
 * REGISTER VALIDATION
 * =====================================================
 */
const registerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 50 }),

  emailValidator,
  passwordValidator,
];

/**
 * =====================================================
 * LOGIN VALIDATION
 * =====================================================
 */
const loginValidation = [
  emailValidator,
  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * =====================================================
 * ROUTE: GUEST SESSION
 * =====================================================
 */
router.post(
  "/guest",
  guestValidation,
  handleValidation,
  (req, res, next) => {
    next();
  },
  createGuestSession,
);

/**
 * =====================================================
 * ROUTE: REGISTER 
 * =====================================================
 */
router.post(
  "/register",
  optionalAuth,
  registerValidation,
  handleValidation,
  (req, res, next) => {
    next();
  },
  register,
);

/**
 * =====================================================
 * ROUTE: LOGIN 
 * =====================================================
 */
router.post(
  "/login",
  optionalAuth,
  loginValidation,
  handleValidation,
  (req, res, next) => {
    next();
  },
  login,
);

/**
 * =====================================================
 * ROUTE: LOGOUT
 * =====================================================
 */
router.post(
  "/logout",
  protect,
  (req, res, next) => {
    next();
  },
  logout,
);

/**
 * =====================================================
 * ROUTE: ME
 * =====================================================
 */
router.get(
  "/me",
  protect,
  (req, res, next) => {
    next();
  },
  getMe,
);

module.exports = router;