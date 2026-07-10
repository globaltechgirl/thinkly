const mongoose = require("mongoose");

/**
 * =====================================================
 * QUESTION SCHEMA
 * =====================================================
 */
const questionSchema = new mongoose.Schema(
  {
    /**
     * =====================================================
     * RELATION
     * =====================================================
     */
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      immutable: true,
    },

    /**
     * =====================================================
     * CONTENT
     * =====================================================
     */
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
      index: "text",
    },

    options: {
      type: [String],
      required: true,
      default: [],

      validate: {
        validator: (v) =>
          Array.isArray(v) &&
          v.length >= 2 &&
          v.length <= 10 &&
          v.every((opt) => typeof opt === "string" && opt.trim().length > 0),

        message: "At least 2 valid options required",
      },
    },

    correctOption: {
      type: Number,
      required: true,
      min: 0,
    },

    points: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      index: true,
    },

    explanation: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    /**
     * =====================================================
     * ANALYTICS
     * IMPORTANT:
     * ONLY AGGREGATE METRICS
     * NEVER STORE USER ATTEMPTS HERE
     * =====================================================
     */
    stats: {
      attempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      correctCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      averageTimeSeconds: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    /**
     * =====================================================
     * VERSIONING
     * =====================================================
     */
    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    /**
     * =====================================================
     * METADATA
     * =====================================================
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
 * INDEXES (OPTIMIZED)
 * =====================================================
 */

questionSchema.index({
  quiz: 1,
  createdAt: 1,
});

questionSchema.index({
  quiz: 1,
  difficulty: 1,
});

questionSchema.index({
  quiz: 1,
});

questionSchema.index({
  createdAt: -1,
});

questionSchema.index(
  {
    question: "text",
    options: "text",
  },
  {
    name: "question_text_search_index",
  },
);

/**
 * =====================================================
 * VALIDATION PIPELINE (HARDENED)
 * =====================================================
 */

questionSchema.pre("validate", function (next) {
  try {
    /**
     * CLEAN QUESTION
     */
    if (this.question) {
      this.question = this.question.trim();
    }

    if (!this.question || this.question.length < 3) {
      return next(new Error("Question is too short"));
    }

    /**
     * OPTIONS VALIDATION
     */
    if (!Array.isArray(this.options)) {
      return next(new Error("Options must be an array"));
    }

    this.options = this.options
      .map((opt) => (typeof opt === "string" ? opt.trim() : ""))
      .filter((opt) => opt.length > 0)
      .slice(0, 10);

    /**
     * DUPLICATE OPTION PROTECTION
     */
    const normalized = this.options.map((o) => o.toLowerCase());

    const unique = new Set(normalized);

    if (unique.size !== this.options.length) {
      return next(new Error("Duplicate options are not allowed"));
    }

    if (this.options.length < 2) {
      return next(new Error("Minimum 2 valid options required"));
    }

    /**
     * VALIDATE CORRECT OPTION
     */
    const correct = Number(this.correctOption);

    if (!Number.isInteger(correct)) {
      return next(new Error("correctOption must be an integer"));
    }

    if (correct < 0 || correct >= this.options.length) {
      return next(new Error("correctOption out of bounds"));
    }

    this.correctOption = correct;

    /**
     * CLEAN EXPLANATION
     */
    if (this.explanation) {
      this.explanation = this.explanation.trim();
    }

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * =====================================================
 * SAFE SERIALIZATION
 * NEVER EXPOSE correctOption IN PUBLIC QUIZ FETCH
 * =====================================================
 */

questionSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    quiz: this.quiz,
    question: this.question,
    options: this.options,
    points: this.points,
    difficulty: this.difficulty,
    explanation: this.explanation,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/**
 * =====================================================
 * CORE LOGIC METHODS
 * =====================================================
 */

questionSchema.methods.isCorrectAnswer = function (selectedIndex) {
  return Number(selectedIndex) === this.correctOption;
};

questionSchema.methods.getPointsForAnswer = function (selectedIndex) {
  return this.isCorrectAnswer(selectedIndex) ? this.points : 0;
};

/**
 * =====================================================
 * ATOMIC STATS
 * CONCURRENCY SAFE
 * =====================================================
 */

questionSchema.methods.recordAttempt = function () {
  return this.updateOne({
    $inc: {
      "stats.attempts": 1,
    },
  });
};

questionSchema.methods.recordCorrect = function () {
  return this.updateOne({
    $inc: {
      "stats.correctCount": 1,
    },
  });
};

/**
 * =====================================================
 * SAFE AVERAGE TIME UPDATE
 * =====================================================
 */

questionSchema.methods.updateAverageTime = async function (newTimeSeconds) {
  const time = Number(newTimeSeconds);

  if (!Number.isFinite(time) || time < 0) {
    throw new Error("Invalid time value");
  }

  return this.updateOne({
    $set: {
      "stats.averageTimeSeconds": time,
    },
  });
};

/**
 * =====================================================
 * STATIC HELPERS
 * IMPORTANT:
 * USE THESE TO ENFORCE GUEST ISOLATION
 * =====================================================
 */

questionSchema.statics.findByGuest = function (guestId, extra = {}) {
  return this.find({
    ...extra,
  });
};

questionSchema.statics.findQuizQuestions = function (quizId, guestId) {
  return this.find({
    quiz: quizId,
  });
};

/**
 * =====================================================
 * EXPORT
 * =====================================================
 */

module.exports =
  mongoose.models.Question || mongoose.model("Question", questionSchema);
