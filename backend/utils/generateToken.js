const jwt = require("jsonwebtoken");

/**
 * Generate JWT token
 * @param {Object|string} userOrId - User/guest object or User ID string
 */
const generateToken = (userOrId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  let payload;

  if (typeof userOrId === "string") {
    // Legacy: string ID only
    payload = { id: userOrId };
  } else if (typeof userOrId === "object" && userOrId) {
    // New: full user/guest object
    payload = {
      id: userOrId.isGuest ? null : userOrId._id || userOrId.id || null,
      email: userOrId.email || null,
      guestId: userOrId.guestId || null,
      isGuest: userOrId.isGuest || false,
    };
  } else {
    throw new Error("Invalid token payload");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
