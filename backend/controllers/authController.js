const { validationResult } = require("express-validator");
const User = require("../models/user");
const authService = require("../services/auth");

/**
 * =====================================================
 * VALIDATION HANDLER
 * =====================================================
 */
const handleValidation = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
    return false;
  }

  return true;
};

/**
 * =====================================================
 * NORMALIZER
 * =====================================================
 */
const normalize = (data = {}) => {
  return {
    fullName: typeof data.fullName === "string" ? data.fullName.trim() : "",
    email:
      typeof data.email === "string" ? data.email.trim().toLowerCase() : "",
    password: typeof data.password === "string" ? data.password : "",
  };
};

const hasAuthToken = (req) => {
  const authHeader = req.headers.authorization;

  return Boolean(
    (authHeader && authHeader.startsWith("Bearer ")) || req.cookies?.token,
  );
};

/**
 * =====================================================
 * SANITIZE USER
 * =====================================================
 */
const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user._id || null,
    fullName: user.fullName,
    email: user.email,
    isGuest: user.isGuest,
    guestId: user.guestId,
    createdAt: user.createdAt,
  };
};

/**
 * =====================================================
 * GUEST SESSION
 * =====================================================
 */
exports.createGuestSession = async (req, res) => {
  try {
    const { fullName, email } = normalize(req.body);

    if (!fullName) {
      return res
        .status(400)
        .json({ success: false, message: "fullName is required" });
    }

    const result = await authService.createGuestSession({
      fullName,
      email,
    });

    return res
      .status(201)
      .json({ success: true, message: "Guest session created", ...result });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Guest session failed",
    });
  }
};

/**
 * =====================================================
 * REGISTER
 * =====================================================
 */
exports.register = async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;

    const { fullName, email, password } = normalize(req.body);

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "fullName, email, and password are required",
      });
    }

    const existed = await User.findOne({ email });

    const result = await authService.registerUser({
      fullName,
      email,
      password,
      currentUser: req.user,
    });

    const status = existed ? 200 : 201;

    return res
      .status(status)
      .json({ success: true, message: "Account processed", ...result });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

/**
 * =====================================================
 * LOGIN
 * =====================================================
 */
exports.login = async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;

    const { email, password } = normalize(req.body);

    const result = await authService.loginUser({ email, password });

    return res
      .status(200)
      .json({ success: true, message: "Login successful", ...result });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: error.message || "Login failed" });
  }
};

/**
 * =====================================================
 * GET CURRENT USER
 * =====================================================
 */
exports.getMe = async (req, res) => {
  try {
    const result = await authService.getCurrentUser(req.user.id);

    return res.status(200).json({ success: true, user: result });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user",
    });
  }
};

/**
 * =====================================================
 * LOGOUT
 * =====================================================
 */
exports.logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Account closed successfully",
  });
};