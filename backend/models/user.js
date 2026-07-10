const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const emailRegex = /^\S+@\S+\.\S+$/;

/**
 * =====================================================
 * USER SCHEMA
 * =====================================================
 */

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 100,
      required: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      validate: {
        validator: (v) => emailRegex.test(v),
        message: "Invalid email format",
      },
    },

    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin", "guest"],
      default: "user",
    },

    password: {
      type: String,
      minlength: 8,
      select: false,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["guest", "local", "google", "github"],
      default: "local",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    /**
     * =========================
     * IDENTITY SYSTEM (CORE FIX)
     * =========================
     */

    /**
     * NOT random per document creation.
     *
     * It is created ONCE and preserved forever.
     */
    guestId: {
      type: String,
      default: null,
    },

    isGuest: {
      type: Boolean,
      default: false,
    },

    guestConvertedAt: {
      type: Date,
      default: null,
    },

    linkedGuestIds: {
      type: [String],
      default: [],
    },

    linkedQuizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],

    quizAttempts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attempt",
      },
    ],
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

/**
 * =====================================================
 * INDEXES
 * =====================================================
 */
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ guestId: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

/**
 * =====================================================
 * PRE-SAVE: EMAIL NORMALIZATION + GUEST ID GUARANTEE
 * =====================================================
 */
userSchema.pre("save", function (next) {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();

    if (!emailRegex.test(this.email)) {
      return next(new Error("Invalid email format"));
    }
  }

  if (!this.guestId) {
    this.guestId = uuidv4();
  }

  next();
});

/**
 * =====================================================
 * PASSWORD HASHING
 * =====================================================
 */
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * =====================================================
 * METHODS
 * =====================================================
 */
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

/**
 * =====================================================
 * EXPORT
 * =====================================================
 */
module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);