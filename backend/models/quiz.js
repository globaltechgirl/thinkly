"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");

/**
 * =====================================================
 * CONSTANTS
 * =====================================================
 */
const emailRegex = /^\S+@\S+\.\S+$/;

const QUIZ_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
});

const QUIZ_RUNTIME_STATUS = Object.freeze({
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  ENDED: "ENDED",
});

/**
 * =====================================================
 * HELPERS
 * =====================================================
 */
const cleanString = (value) => {
  return typeof value === "string" ? value.trim() : value;
};

const generateSlug = (value) => {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join("-");

  const random = crypto.randomBytes(3).toString("hex");

  return `${base}-${random}`;
};

const generateSubdomain = (value) => {
  const cleanName = value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 15);

  const random = crypto.randomBytes(2).toString("hex");

  return `${cleanName}${random}`;
};

/**
 * =====================================================
 * QUESTION SCHEMA
 * =====================================================
 */
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },

    options: {
      type: [String],
      required: true,

      validate: {
        validator: (value) => {
          return (
            Array.isArray(value) &&
            value.length >= 2 &&
            value.length <= 20 &&
            value.every((v) => typeof v === "string" && v.trim().length > 0)
          );
        },

        message: "Each question must contain 2-20 valid options",
      },
    },

    correctOption: {
      type: Number,
      required: true,
      min: 0,

      validate: {
        validator: function (v) {
          return this.options && v < this.options.length;
        },

        message: "Correct option index invalid",
      },
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },

    points: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
  },
  {
    _id: false,
  },
);

/**
 * =====================================================
 * QUIZ SCHEMA
 * =====================================================
 */
const quizSchema = new mongoose.Schema(
  {
    /**
     * CORE INFO
     */
    quizName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    companyName: {
      type: String,
      default: "",
      trim: true,
    },

    contactName: {
      type: String,
      default: "",
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,

      set: (v) => {
        if (!v) return undefined;

        return v.toLowerCase().trim();
      },

      validate: {
        validator: (v) => {
          return !v || emailRegex.test(v);
        },

        message: "Invalid contact email",
      },
    },

    /**
     * OWNER
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    /**
     * ACCESS CONTROL
     */
    allowGuests: {
      type: Boolean,
      default: true,
    },

    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },

    /**
     * STATUS
     */
    status: {
      type: String,
      enum: Object.values(QUIZ_STATUS),
      default: QUIZ_STATUS.DRAFT,
      index: true,
    },

    runtimeStatus: {
      type: String,
      enum: Object.values(QUIZ_RUNTIME_STATUS),
      default: QUIZ_RUNTIME_STATUS.INACTIVE,
      index: true,
    },

    /**
     * TIMING
     */
    startTime: {
      type: Date,
    },

    endTime: {
      type: Date,
    },

    durationMinutes: {
      type: Number,
      min: 1,
      max: 1440,
    },

    /**
     * QUIZ SETTINGS
     */
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },

    allowRetake: {
      type: Boolean,
      default: false,
    },

    maxAttempts: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },

    leaderboardEnabled: {
      type: Boolean,
      default: true,
    },

    /**
     * QUESTIONS
     */
    questions: {
      type: [questionSchema],
      default: [],
    },

    /**
     * ANALYTICS
     */
    stats: {
      totalAttempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalParticipants: {
        type: Number,
        default: 0,
        min: 0,
      },

      averageScore: {
        type: Number,
        default: 0,
        min: 0,
      },

      views: {
        type: Number,
        default: 0,
        min: 0,
      },

      completions: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    /**
     * IDENTIFIERS
     */
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    subdomain: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    /**
     * VERSIONING
     */
    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    /**
     * EXTRA METADATA
     */
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,

    minimize: false,

    toJSON: {
      virtuals: true,
      versionKey: false,

      transform: (_, ret) => {
        ret.id = ret._id;

        delete ret._id;

        return ret;
      },
    },

    toObject: {
      virtuals: true,
    },
  },
);

/**
 * =====================================================
 * INDEXES
 * =====================================================
 */

quizSchema.index({
  createdBy: 1,
  createdAt: -1,
});

quizSchema.index({
  status: 1,
  runtimeStatus: 1,
});

quizSchema.index({
  isPublic: 1,
  status: 1,
});

quizSchema.index({
  status: 1,
  createdAt: -1,
});

quizSchema.index({
  runtimeStatus: 1,
  startTime: 1,
  endTime: 1,
});

/**
 * =====================================================
 * VIRTUALS
 * =====================================================
 */

/**
 * PUBLIC QUIZ LINK
 */
quizSchema.virtual("quizLink").get(function () {
  return this.slug ? `/play/${this.slug}` : null;
});

/**
 * IS ACTIVE NOW
 */
quizSchema.virtual("isActiveNow").get(function () {
  const now = new Date();

  return (
    this.runtimeStatus === QUIZ_RUNTIME_STATUS.ACTIVE &&
    (!this.startTime || now >= this.startTime) &&
    (!this.endTime || now <= this.endTime)
  );
});

/**
 * QUESTION COUNT
 */
quizSchema.virtual("questionCount").get(function () {
  return this.questions?.length || 0;
});

/**
 * =====================================================
 * VALIDATION
 * =====================================================
 */
quizSchema.pre("validate", function (next) {
  try {
    /**
     * TIME VALIDATION
     */
    if (this.startTime && this.endTime && this.endTime <= this.startTime) {
      return next(new Error("End time must be after start time"));
    }

    /**
     * MAX QUESTIONS
     */
    if (Array.isArray(this.questions) && this.questions.length > 500) {
      return next(new Error("Maximum 500 questions allowed"));
    }

    /**
     * PUBLISHED QUIZ MUST HAVE QUESTIONS
     */
    if (
      this.status === QUIZ_STATUS.PUBLISHED &&
      (!this.questions || !this.questions.length)
    ) {
      return next(new Error("Published quiz must contain questions"));
    }

    /**
     * ATTEMPT RULES
     */
    if (this.allowRetake === false && this.maxAttempts > 1) {
      this.maxAttempts = 1;
    }

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * =====================================================
 * SAVE MIDDLEWARE
 * =====================================================
 */
quizSchema.pre("save", function (next) {
  try {
    /**
     * CLEAN STRINGS
     */
    this.quizName = cleanString(this.quizName);

    this.description = cleanString(this.description);

    this.companyName = cleanString(this.companyName);

    this.contactName = cleanString(this.contactName);

    /**
     * CLEAN QUESTIONS
     */
    if (Array.isArray(this.questions)) {
      this.questions = this.questions.map((q) => ({
        ...q,

        question: cleanString(q.question),

        options: q.options?.map((opt) => cleanString(opt)) || [],

        explanation: cleanString(q.explanation),
      }));
    }

    /**
     * GENERATE SLUG
     */
    if (!this.slug && this.quizName) {
      this.slug = generateSlug(this.quizName);
    }

    /**
     * GENERATE SUBDOMAIN
     */
    if (!this.subdomain && this.quizName) {
      this.subdomain = generateSubdomain(this.quizName);
    }

    /**
     * VERSIONING
     */
    if (!this.isNew) {
      this.version += 1;
    }

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

/**
 * INCREMENT VIEWS
 */
quizSchema.methods.incrementViews = async function () {
  this.stats.views += 1;

  return this.save({
    validateBeforeSave: false,
  });
};

/**
 * ACTIVATE QUIZ
 */
quizSchema.methods.activate = async function () {
  this.runtimeStatus = QUIZ_RUNTIME_STATUS.ACTIVE;

  return this.save();
};

/**
 * PAUSE QUIZ
 */
quizSchema.methods.pause = async function () {
  this.runtimeStatus = QUIZ_RUNTIME_STATUS.PAUSED;

  return this.save();
};

/**
 * END QUIZ
 */
quizSchema.methods.end = async function () {
  this.runtimeStatus = QUIZ_RUNTIME_STATUS.ENDED;

  return this.save();
};

/**
 * =====================================================
 * STATIC HELPERS
 * =====================================================
 */

/**
 * FIND ACTIVE PUBLIC QUIZZES
 */
quizSchema.statics.findPublicActive = function () {
  return this.find({
    isPublic: true,
    status: QUIZ_STATUS.PUBLISHED,
    runtimeStatus: QUIZ_RUNTIME_STATUS.ACTIVE,
  }).sort({
    createdAt: -1,
  });
};

/**
 * =====================================================
 * MODEL
 * =====================================================
 */
const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

/**
 * =====================================================
 * INDEX SYNC
 * =====================================================
 */

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */
module.exports = Quiz;