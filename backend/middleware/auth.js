"use strict";

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");

const DEBUG = process.env.DEBUG_AUTH === "true";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

/**
 * =====================================================
 * TOKEN HELPERS
 * =====================================================
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return req.cookies?.token || null;
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

/**
 * =====================================================
 * SAFE USER FORMAT
 * =====================================================
 */
const buildUser = (user) => {
  if (!user) return null;

  return {
    id: user.isGuest ? null : user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isGuest: user.isGuest || false,
    guestId: user.guestId || null,
  };
};

const findUserByGuestId = async (guestId) => {
  if (!guestId) return null;
  return User.findOne({ guestId });
};

/**
 * =====================================================
 * CORE RULE: GUEST ID RESOLUTION
 * =====================================================
 */
const resolveGuestId = async (email) => {
  if (!email) return uuidv4();

  const user = await User.findOne({ email });

  if (user?.guestId) return user.guestId;

  return uuidv4();
};

/**
 * =====================================================
 * ROLE AUTHORIZATION
 * =====================================================
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};

/**
 * =====================================================
 * GUEST FLOW
 * =====================================================
 */
exports.guest = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({
        success: false,
        message: "fullName and email are required",
      });
    }

    let user = await User.findOne({ email });

    const guestId = await resolveGuestId(email);

    if (!user) {
      user = await User.create({
        fullName,
        email,
        isGuest: true,
        role: "guest",
        guestId,
      });
    }

    if (user.isGuest && !user.guestId) {
      user.guestId = guestId;
      await user.save();
    }

    return res.json({
      success: true,
      token: jwt.sign(
        {
          id: user._id,
          guestId: user.guestId, // IMPORTANT
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      ),
      user: buildUser(user),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * =====================================================
 * REGISTER (UPGRADE GUEST → USER)
 * =====================================================
 */
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "fullName, email, and password are required",
      });
    }

    let user = await User.findOne({ email });

    const guestId = await resolveGuestId(email);

    if (user) {
      user.fullName = fullName;
      user.password = password;
      user.isGuest = false;
      user.role = "user";

      if (!user.guestId) {
        user.guestId = guestId;
      }

      await user.save();

      return res.json({
        success: true,
        message: "Account upgraded successfully",
        token: jwt.sign(
          {
            id: user._id,
            guestId: user.guestId,
          },
          JWT_SECRET,
          { expiresIn: "7d" },
        ),
        user: buildUser(user),
      });
    }

    const newUser = await User.create({
      fullName,
      email,
      password,
      role: "user",
      isGuest: false,
      guestId,
    });

    return res.json({
      success: true,
      message: "User registered successfully",
      token: jwt.sign(
        {
          id: newUser._id,
          guestId: newUser.guestId,
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      ),
      user: buildUser(newUser),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
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
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.guestId) {
      user.guestId = await resolveGuestId(email);
      await user.save();
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      success: true,
      token: jwt.sign(
        {
          id: user._id,
          guestId: user.guestId,
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      ),
      user: buildUser(user),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * =====================================================
 * AUTH MIDDLEWARE
 * =====================================================
 */
exports.protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    let identity = {
      user: null,
      guestId: null,
    };

    if (token) {
      const decoded = verifyToken(token);

      if (decoded?.id) {
        const user = await User.findById(decoded.id);

        if (user) {
          identity.user = user;
          identity.guestId = user.guestId;
        }
      } else if (decoded?.guestId) {
        identity.guestId = decoded.guestId;
      }
    }

    if (!identity.user && identity.guestId) {
      const guestUser = await findUserByGuestId(identity.guestId);
      if (guestUser) {
        identity.user = guestUser;
        identity.guestId = guestUser.guestId;
      }
    }

    if (!identity.guestId) {
      identity.guestId = uuidv4();
    }

    req.identity = identity;

    req.user = identity.user
      ? buildUser(identity.user)
      : {
          id: null,
          role: "guest",
          isGuest: true,
          guestId: identity.guestId,
        };

    next();
  } catch (err) {
    const fallbackGuestId = uuidv4();

    req.identity = {
      user: null,
      guestId: fallbackGuestId,
    };

    req.user = {
      id: null,
      role: "guest",
      isGuest: true,
      guestId: fallbackGuestId,
    };

    next();
  }
};

/**
 * =====================================================
 * OPTIONAL AUTH 
 * =====================================================
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    let identity = {
      user: null,
      guestId: null,
    };

    if (token) {
      const decoded = verifyToken(token);

      if (decoded?.id) {
        const user = await User.findById(decoded.id);

        if (user) {
          identity.user = user;
          identity.guestId = user.guestId;
        }
      } else if (decoded?.guestId) {
        identity.guestId = decoded.guestId;
      }
    }

    if (!identity.user && identity.guestId) {
      const guestUser = await findUserByGuestId(identity.guestId);
      if (guestUser) {
        identity.user = guestUser;
        identity.guestId = guestUser.guestId;
      }
    }

    if (!identity.guestId) {
      identity.guestId = uuidv4();
    }

    req.identity = identity;

    req.user = identity.user
      ? buildUser(identity.user)
      : {
          id: null,
          role: "guest",
          isGuest: true,
          guestId: identity.guestId,
        };

    next();
  } catch (err) {
    const fallbackGuestId = uuidv4();

    req.identity = {
      user: null,
      guestId: fallbackGuestId,
    };

    req.user = {
      id: null,
      role: "guest",
      isGuest: true,
      guestId: fallbackGuestId,
    };

    next();
  }
};