const User = require("../models/user");
const authService = require("../services/auth");

/**
 * =====================================================
 * SAFE USER RESPONSE MAPPER
 * =====================================================
 */
const mapUserResponse = (user) => {
  if (!user) return null;

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber || null,
    role: user.role,
    profilePicture: user.profilePicture || null,
    isGuest: user.isGuest,
    guestId: user.guestId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * =====================================================
 * GET USER PROFILE
 * =====================================================
 */
exports.getProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: mapUserResponse(user),
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

/**
 * =====================================================
 * UPDATE USER PROFILE
 * =====================================================
 */
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const { fullName, phoneNumber, profilePicture, email, role } = req.body;

    const updateData = {};

    if (typeof fullName === "string" && fullName.trim()) {
      updateData.fullName = fullName.trim();
    }

    if (typeof phoneNumber === "string") {
      updateData.phoneNumber = phoneNumber.trim();
    }

    if (typeof profilePicture === "string") {
      updateData.profilePicture = profilePicture.trim();
    }

    if (email && typeof email === "string") {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Invalid email",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      updateData.email = normalizedEmail;
    }

    if (typeof role === "string" && role.trim()) {
      updateData.role = role.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: mapUserResponse(user),
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

/**
 * =====================================================
 * MERGE GUEST HISTORY INTO REGISTERED USER
 * =====================================================
 */
exports.mergeGuest = async (req, res) => {
  try {
    const userId = req.user?.id;
    const guestId = req.user?.guestId || null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!guestId) {
      return res.status(400).json({
        success: false,
        message: "guestId is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isGuest) {
      return res.status(403).json({
        success: false,
        message: "Guest users cannot merge guest history",
      });
    }

    user.linkedGuestIds = user.linkedGuestIds || [];

    if (!user.linkedGuestIds.includes(guestId)) {
      user.linkedGuestIds.push(guestId);
    }

    authService.unifyGuestIds(user, guestId);

    if (!user.guestId) {
      user.guestId = guestId;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Guest history merged successfully",
      user: mapUserResponse(user),
    });
  } catch (error) {
    console.error("MERGE GUEST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to merge guest history",
    });
  }
};