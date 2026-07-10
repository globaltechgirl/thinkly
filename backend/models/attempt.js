"use strict";

const mongoose = require("mongoose");

/**
 * =====================================================
 * ATTEMPT STATES
 * =====================================================
 */
const ATTEMPT_STATES = Object.freeze({
  IN_PROGRESS: "IN_PROGRESS",
  SUBMITTED: "SUBMITTED",
  ABANDONED: "ABANDONED",
  EXPIRED: "EXPIRED",
});

/**
 * =====================================================
 * BREAKDOWN SCHEMA
 * =====================================================
 */
const breakdownSchema = new mongoose.Schema(
  {
    questionIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    selectedOption: {
      type: Number,
      default: null,
      min: 0,
    },

    correctOption: {
      type: Number,
      required: true,
      min: 0,
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },

    points: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

/**
 * =====================================================
 * ATTEMPT SCHEMA
 * =====================================================
 */
const attemptSchema = new mongoose.Schema(
  {
    /**
     * QUIZ
     */
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    /**
     * AUTH USER
     * IMPORTANT:
     * NO default:null
     * prevents Mongo unique collisions
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /**
     * GUEST USER
     * IMPORTANT:
     * NO default:null
     */
    guestId: {
      type: String,
      trim: true,
      immutable: true,
    },

    /**
     * GUEST SNAPSHOT
     */
    guestSnapshot: {
      fullName: {
        type: String,
        trim: true,
        default: "",
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },
    },

    /**
     * ATTEMPT INFO
     */
    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
    },

    status: {
      type: String,
      enum: Object.values(ATTEMPT_STATES),
      default: ATTEMPT_STATES.IN_PROGRESS,
      index: true,
    },

    /**
     * ANSWERS
     */
    answers: {
      type: Map,
      of: Number,
      default: {},
    },

    /**
     * SCORE
     */
    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    leaderboardScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    breakdown: {
      type: [breakdownSchema],
      default: [],
    },

    /**
     * TIMING
     */
    startedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
    },

    timeTakenSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * META
     */
    meta: {
      ipAddress: {
        type: String,
        default: "",
        select: false,
      },

      userAgent: {
        type: String,
        default: "",
        select: false,
      },

      tabSwitchCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      suspiciousActivityScore: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    /**
     * LOCKS
     */
    resultLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

/**
 * =====================================================
 * INDEXES
 * =====================================================
 * IMPORTANT:
 * sparse:true prevents null collisions
 * for guest/auth separation
 */

/**
 * AUTH USER UNIQUE ATTEMPT
 */
attemptSchema.index(
  { quiz: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: {
      user: { $exists: true, $ne: null },
    },
    name: "quiz_user_unique_attempt",
  },
);

/**
 * GUEST UNIQUE ATTEMPT
 */
attemptSchema.index(
  { quiz: 1, guestId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      guestId: { $exists: true, $ne: null },
    },
    name: "quiz_guest_unique_attempt",
  },
);

/**
 * HISTORY INDEXES
 */
attemptSchema.index({
  user: 1,
  createdAt: -1,
});

attemptSchema.index({
  guestId: 1,
  createdAt: -1,
});

attemptSchema.index({
  quiz: 1,
  createdAt: -1,
});

/**
 * LEADERBOARD INDEX
 */
attemptSchema.index({
  quiz: 1,
  leaderboardScore: -1,
  submittedAt: 1,
});

/**
 * =====================================================
 * VALIDATION
 * =====================================================
 */
attemptSchema.pre("validate", function (next) {
  try {
    const hasUser = !!this.user;

    if (hasUser && !this.guestId) {
      this.guestId = `user_${this.user.toString()}`;
    }

    const hasGuest =
      typeof this.guestId === "string" && this.guestId.trim().length > 0;

    /**
     * MUST HAVE IDENTITY
     */
    if (!hasUser && !hasGuest) {
      return next(new Error("Either user or guestId required"));
    }

    /**
     * CLEAN GUEST ID
     */
    if (hasGuest) {
      this.guestId = this.guestId.trim();
    }

    /**
     * Remove explicit null values so sparse indexes behave correctly
     */
    if (!hasUser) {
      this.user = undefined;
    }

    if (!hasGuest) {
      this.guestId = undefined;
    }

    /**
     * SCORE VALIDATION
     */
    if (this.score < 0 || this.totalScore < 0) {
      return next(new Error("Invalid score values"));
    }

    if (this.score > this.totalScore) {
      return next(new Error("Score cannot exceed totalScore"));
    }

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * =====================================================
 * DERIVED VALUES
 * =====================================================
 */
attemptSchema.pre("save", function (next) {
  try {
    /**
     * PERCENTAGE
     */
    this.percentage =
      this.totalScore > 0
        ? Math.round((this.score / this.totalScore) * 100)
        : 0;

    /**
     * LEADERBOARD SCORE
     */
    this.leaderboardScore = this.percentage;

    /**
     * TIME TAKEN
     */
    if (this.startedAt && this.submittedAt) {
      this.timeTakenSeconds = Math.max(
        0,
        Math.floor((this.submittedAt - this.startedAt) / 1000),
      );
    }

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * =====================================================
 * INSTANCE METHODS
 * =====================================================
 */
attemptSchema.methods.markSubmitted = function () {
  this.status = ATTEMPT_STATES.SUBMITTED;

  this.submittedAt = new Date();

  this.resultLocked = true;

  if (this.startedAt) {
    this.timeTakenSeconds = Math.max(
      0,
      Math.floor((this.submittedAt - this.startedAt) / 1000),
    );
  }

  return this;
};

/**
 * =====================================================
 * SAFE SERIALIZATION
 * =====================================================
 */
attemptSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,

    quiz: this.quiz,

    user: this.user || null,

    guestId: this.guestId || null,

    score: this.score,

    totalScore: this.totalScore,

    percentage: this.percentage,

    leaderboardScore: this.leaderboardScore,

    breakdown: this.breakdown,

    startedAt: this.startedAt,

    submittedAt: this.submittedAt,

    timeTakenSeconds: this.timeTakenSeconds,

    status: this.status,

    createdAt: this.createdAt,

    updatedAt: this.updatedAt,
  };
};

/**
 * =====================================================
 * STATIC HELPERS
 * =====================================================
 */

/**
 * FIND ACTIVE ATTEMPT
 */
attemptSchema.statics.findActiveAttempt = function ({
  quizId,
  userId,
  guestId,
}) {
  const query = {
    quiz: quizId,
    status: ATTEMPT_STATES.IN_PROGRESS,
  };

  if (guestId) {
    query.guestId = guestId;
  } else if (userId) {
    query.guestId = `user_${userId}`;
  } else {
    throw new Error("Identity required");
  }

  return this.findOne(query);
};

/**
 * FIND USER ATTEMPTS
 */
attemptSchema.statics.findUserAttempts = function ({
  userId,
  guestId,
  quizId,
}) {
  const query = {};

  if (guestId) {
    query.guestId = guestId;
  } else if (userId) {
    query.guestId = `user_${userId}`;
  } else {
    throw new Error("Identity required");
  }

  if (quizId) {
    query.quiz = quizId;
  }

  return this.find(query).sort({
    createdAt: -1,
  });
};

/**
 * =====================================================
 * MODEL
 * =====================================================
 */
const Attempt =
  mongoose.models.Attempt || mongoose.model("Attempt", attemptSchema);

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */
module.exports = {
  Attempt,
  ATTEMPT_STATES,
};
