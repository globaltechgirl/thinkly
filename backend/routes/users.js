const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const { getProfile, updateProfile } = require("../controllers/userController");

const { protect } = require("../middleware/auth");

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
      errors: errors.array(),
    });
  }

  next();
};

/**
 * =====================================================
 * UPDATE PROFILE VALIDATION
 * =====================================================
 */
const updateProfileValidation = [
  /**
   * =====================================================
   * BASIC FIELDS (SAFE OPTIONAL VALIDATION)
   * =====================================================
   */
  body("fullName")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be 2–50 characters"),

  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("phoneNumber")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Phone number must be a string")
    .isLength({ min: 7, max: 20 })
    .withMessage("Phone number must be 7–20 characters"),

  body("profilePicture")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Profile picture must be a valid URL"),

  body("role").custom((value, { req }) => {
    if (!value) {
      return true;
    }

    if (req.user?.isGuest) {
      throw new Error("Guests cannot change roles");
    }

    const currentRole = req.user?.role?.toLowerCase();
    const newRole = value.toLowerCase();

    if (!currentRole) {
      throw new Error("User role not loaded");
    }

    if (currentRole === newRole) {
      return true;
    }

    const allowedTransitions = {
      user: ["admin"],
      admin: ["user"],
    };

    const allowed = allowedTransitions[currentRole]?.includes(newRole);

    if (!allowed) {
      throw new Error("Invalid role transition");
    }
    return true;
  }),
];

/**
 * =====================================================
 * ROUTE: GET PROFILE
 * =====================================================
 */
router.get(
  "/profile",
  protect,
  (req, res, next) => {
    next();
  },
  getProfile,
);

/**
 * =====================================================
 * ROUTE: UPDATE PROFILE
 * =====================================================
 */
router.patch(
  "/profile",
  protect,
  (req, res, next) => {
    next();
  },
  updateProfileValidation,
  handleValidation,
  updateProfile,
);

router.post(
  "/merge-guest",
  protect,
  handleValidation,
  (req, res, next) => {
    next();
  },
  async (req, res) => {
    const { mergeGuest } = require("../controllers/userController");
    return mergeGuest(req, res);
  },
);

module.exports = router;
