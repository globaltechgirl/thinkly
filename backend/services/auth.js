const User = require("../models/user");
const { Attempt } = require("../models/attempt");
const generateToken = require("../utils/generateToken");
const { v4: uuidv4 } = require("uuid");

/**
 * =====================================================
 * HELPERS
 * =====================================================
 */

/**
 * Normalize Email
 */
const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();

  if (!normalized || normalized === "null" || normalized === "undefined") {
    return null;
  }

  return normalized;
};

/**
 * Normalize Guest ID
 */
const normalizeGuestId = (guestId) => {
  if (!guestId || typeof guestId !== "string") {
    return null;
  }

  let normalized = guestId.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("guest_")) {
    normalized = normalized.slice(6);
  }

  return normalized || null;
};

/**
 * Normalize a list of guest IDs
 */
const normalizeGuestIds = (ids = []) => {
  return Array.from(
    new Set(ids.filter(Boolean).map(normalizeGuestId).filter(Boolean)),
  );
};

const findGuestByEmail = (email, session = null) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const query = User.findOne({ email: normalizedEmail, isGuest: true });
  if (session) query.session(session);
  return query;
};

const findGuestById = (guestId, session = null) => {
  const queryFilter = buildGuestIdQuery(guestId);
  if (!queryFilter) return null;

  const query = User.findOne({ ...queryFilter, isGuest: true });
  if (session) query.session(session);
  return query;
};

const findUserByGuestId = async (guestId, session = null) => {
  const query = buildGuestIdQuery(guestId);

  if (!query) return null;

  const q = User.findOne(query);
  if (session) q.session(session);
  return q;
};

/**
 * Generate Stable Guest ID
 */
const generateGuestId = () => {
  return uuidv4();
};

const buildGuestIdQuery = (guestId) => {
  const normalized = normalizeGuestId(guestId);

  if (!normalized) {
    return null;
  }

  return {
    $or: [
      { guestId: normalized },
      { linkedGuestIds: normalized },
      { guestId: `guest_${normalized}` },
      { linkedGuestIds: `guest_${normalized}` },
    ],
  };
};

const resolvePrimaryGuestId = async (guestId) => {
  const user = await findUserByGuestId(guestId);
  const normalized = normalizeGuestId(guestId);

  if (user?.guestId) {
    return normalizeGuestId(user.guestId);
  }

  return normalized;
};

const resolveCanonicalGuestId = async ({ userId, guestId }) => {
  if (guestId) {
    return await resolvePrimaryGuestId(guestId);
  }

  if (userId) {
    return `user_${userId}`;
  }

  return null;
};

const buildGuestIdentityQuery = async ({ userId, guestId }) => {
  const resolvedGuestId = await resolveCanonicalGuestId({ userId, guestId });
  return resolvedGuestId ? { guestId: resolvedGuestId } : null;
};

const unifyGuestIds = (user, incomingGuestId) => {
  const normalizedIncoming = normalizeGuestId(incomingGuestId);
  const normalizedCurrent = normalizeGuestId(user.guestId);

  const primaryGuestId =
    normalizedCurrent || normalizedIncoming || generateGuestId();

  user.guestId = primaryGuestId;
  user.linkedGuestIds = normalizeGuestIds(user.linkedGuestIds || []);

  if (
    normalizedIncoming &&
    normalizedIncoming !== primaryGuestId &&
    !user.linkedGuestIds.includes(normalizedIncoming)
  ) {
    user.linkedGuestIds.push(normalizedIncoming);
  }

  user.linkedGuestIds = user.linkedGuestIds.filter(
    (id) => id !== primaryGuestId,
  );

  return user;
};

/**
 * Password Validator
 */
const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!/[A-Za-z]/.test(password)) {
    return "Password must contain at least one letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }

  return null;
};

/**
 * Safe User Response
 */
const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user._id || null,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isGuest: user.isGuest,
    guestId: user.guestId,
    authProvider: user.authProvider,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Ensure Guest ID Always Exists
 */
const ensureGuestId = (user) => {
  if (!user.guestId) {
    user.guestId = generateGuestId();
  }
};

/**
 * =====================================================
 * GUEST SESSION
 * =====================================================
 */
exports.createGuestSession = async ({ fullName, email }) => {
  const normalizedEmail = normalizeEmail(email);
  let normalizedGuestId = null;

  if (!fullName) {
    throw new Error("Full name is required");
  }

  const session = await User.startSession();
  try {
    const persistedGuest = await session.withTransaction(async () => {
      let existingGuest = null;

      if (normalizedEmail) {
        existingGuest = await findGuestByEmail(normalizedEmail, session);

        if (existingGuest) {
          existingGuest.fullName = fullName.trim();
          unifyGuestIds(
            existingGuest,
            normalizedGuestId || existingGuest.guestId,
          );
          await existingGuest.save({ session, validateBeforeSave: false });
          return existingGuest;
        }

        const registeredUser = await User.findOne({
          email: normalizedEmail,
          isGuest: false,
        }).session(session);

        if (registeredUser) {
          return registeredUser;
        }

        if (normalizedGuestId) {
          existingGuest = await findGuestById(normalizedGuestId, session);

          if (existingGuest) {
            if (
              !existingGuest.email ||
              existingGuest.email === normalizedEmail
            ) {
              existingGuest.fullName = fullName.trim();
              existingGuest.email = normalizedEmail;
              unifyGuestIds(existingGuest, normalizedGuestId);
              await existingGuest.save({ session, validateBeforeSave: false });
              return existingGuest;
            }
          }

          const anyOwner = await findUserByGuestId(normalizedGuestId, session);
          if (anyOwner) {
            normalizedGuestId = null;
          }
        }

        const safeGuestId = normalizedGuestId || generateGuestId();

        const newGuest = await new User({
          fullName: fullName.trim(),
          email: normalizedEmail,
          role: "guest",
          isGuest: true,
          authProvider: "guest",
          isVerified: false,
          guestId: safeGuestId,
          linkedGuestIds: [],
        }).save({ session, validateBeforeSave: false });

        return newGuest;
      }

      if (normalizedGuestId) {
        const existingGuestById = await findGuestById(
          normalizedGuestId,
          session,
        );

        if (existingGuestById) {
          existingGuestById.fullName = fullName.trim();
          unifyGuestIds(existingGuestById, normalizedGuestId);
          await existingGuestById.save({ session, validateBeforeSave: false });
          return existingGuestById;
        }

        const anyOwner = await findUserByGuestId(normalizedGuestId, session);
        if (anyOwner) {
          normalizedGuestId = null;
        }
      }

      return null;
    });

    if (persistedGuest) {
      return {
        token: generateToken(persistedGuest),
        user: sanitizeUser(persistedGuest),
      };
    }

    const guest = {
      id: null,
      fullName: fullName.trim(),
      email: null,
      role: "guest",
      isGuest: true,
      guestId: normalizedGuestId || generateGuestId(),
    };

    return {
      token: generateToken(guest),
      user: guest,
    };
  } finally {
    session.endSession();
  }
};

/**
 * =====================================================
 * REGISTER USER
 * =====================================================
 */
exports.registerUser = async ({
  fullName,
  email,
  password,
  currentUser = null,
}) => {
  const normalizedEmail = normalizeEmail(email);
  const currentGuestId = currentUser?.isGuest
    ? normalizeGuestId(currentUser.guestId)
    : null;

  if (!fullName || !normalizedEmail || !password) {
    throw new Error("Full name, email, and password are required");
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    throw new Error(passwordError);
  }

  const session = await User.startSession();
  try {
    const registeredUser = await session.withTransaction(async () => {
      let user = await User.findOne({ email: normalizedEmail }).session(
        session,
      );

      if (user) {
        if (!user.isGuest) {
          throw new Error("Email already registered");
        }

        user.fullName = fullName.trim();
        user.password = password;
        user.role = "user";
        user.isGuest = false;
        user.authProvider = "local";
        user.isVerified = true;
        user.guestConvertedAt = new Date();

        if (currentGuestId) {
          unifyGuestIds(user, currentGuestId);
        }

        await user.save({ session });

        if (currentGuestId) {
          await Attempt.updateMany(
            { guestId: currentGuestId },
            { $set: { user: user._id } },
          ).session(session);
        }

        return user;
      }

      let guestOwner = null;
      if (currentGuestId) {
        guestOwner = await findGuestById(currentGuestId, session);
      }

      if (guestOwner) {
        guestOwner.fullName = fullName.trim();
        guestOwner.email = normalizedEmail;
        guestOwner.password = password;
        guestOwner.role = "user";
        guestOwner.isGuest = false;
        guestOwner.authProvider = "local";
        guestOwner.isVerified = true;
        guestOwner.guestConvertedAt = new Date();
        guestOwner.linkedGuestIds = normalizeGuestIds(
          guestOwner.linkedGuestIds || [],
        );

        unifyGuestIds(guestOwner, currentGuestId);

        await guestOwner.save({ session });

        if (currentGuestId) {
          await Attempt.updateMany(
            { guestId: currentGuestId },
            { $set: { user: guestOwner._id } },
          ).session(session);
        }

        return guestOwner;
      }

      const newUser = await new User({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        role: "user",
        isGuest: false,
        authProvider: "local",
        isVerified: true,
        guestId: currentGuestId || generateGuestId(),
        linkedGuestIds: currentGuestId ? [currentGuestId] : [],
      }).save({ session });

      if (currentGuestId) {
        await Attempt.updateMany(
          { guestId: currentGuestId },
          { $set: { user: newUser._id } },
        ).session(session);
      }

      return newUser;
    });

    return {
      token: generateToken(registeredUser),
      user: sanitizeUser(registeredUser),
    };
  } finally {
    session.endSession();
  }
};

/**
 * =====================================================
 * LOGIN USER
 * =====================================================
 */
exports.loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.isGuest) {
    throw new Error("Guest account found. Please register first.");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { lastLoginAt: new Date() } },
  );

  const fresh = await User.findById(user._id);

  return {
    token: generateToken(fresh),
    user: sanitizeUser(fresh),
  };
};

/**
 * =====================================================
 * GET CURRENT USER
 * =====================================================
 */
exports.getCurrentUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return sanitizeUser(user);
};

exports.findUserByGuestId = findUserByGuestId;
exports.resolvePrimaryGuestId = resolvePrimaryGuestId;
exports.resolveCanonicalGuestId = resolveCanonicalGuestId;
exports.buildGuestIdentityQuery = buildGuestIdentityQuery;
exports.normalizeGuestId = normalizeGuestId;
exports.unifyGuestIds = unifyGuestIds;
