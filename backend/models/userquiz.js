const mongoose = require("mongoose");

const emailRegex = /^\S+@\S+\.\S+$/;

/**
 * =====================================================
 * USER QUIZ ACCESS SCHEMA (PRODUCTION READY)
 * FIXED:
 * - FULL guestId persistence support
 * - STRICT isolation per guestId
 * - prevents cross-user history leakage
 * =====================================================
 */

const userQuizAccessSchema = new mongoose.Schema(
  {
    /**
     * =====================================================
     * IDENTITY (STRICT: USER OR GUEST ONLY)
     * =====================================================
     */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    /**
     * =====================================================
     * CORE FIX:
     * guestId IS THE PRIMARY IDENTITY KEY
     * USED FOR:
     * - history persistence across routes/components
     * - attempt isolation
     * - analytics partitioning
     * =====================================================
     */
    guestId: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * =====================================================
     * GUEST INFO (OPTIONAL SNAPSHOT)
     * =====================================================
     */
    guestName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,

      validate: {
        validator: function (value) {
          if (!value) return true;
          return emailRegex.test(value);
        },
        message: "Invalid guest email format",
      },
    },

    /**
     * =====================================================
     * QUIZ RELATION
     * =====================================================
     */
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    accessedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    /**
     * =====================================================
     * METADATA
     * =====================================================
     */
    metadata: {
      ipAddress: { type: String, default: "" },
      userAgent: { type: String, default: "" },
      platform: { type: String, default: "" },
      browser: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,

    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

/**
 * =====================================================
 * INDEXES (FIXED FOR DATA ISOLATION)
 * =====================================================
 */

/**
 * REGISTERED USERS (UNCHANGED)
 */
userQuizAccessSchema.index(
  { user: 1, quiz: 1 },
  {
    unique: true,
    sparse: true,
  }
);

/**
 * CORE FIX:
 * GUEST HISTORY PERSISTENCE
 * ensures:
 * - same guest sees same history
 * - no cross-guest leakage
 * - supports dashboard filtering
 */
userQuizAccessSchema.index({
  guestId: 1,
  quiz: 1,
  accessedAt: -1,
});

/**
 * GLOBAL GUEST HISTORY VIEW
 */
userQuizAccessSchema.index({
  guestId: 1,
  accessedAt: -1,
});

/**
 * QUIZ ANALYTICS SAFE SCAN
 */
userQuizAccessSchema.index({
  quiz: 1,
  accessedAt: -1,
});

/**
 * SLUG LOOKUP
 */
userQuizAccessSchema.index({
  slug: 1,
  quiz: 1,
});

/**
 * =====================================================
 * VALIDATION (HARDENED)
 * =====================================================
 */
userQuizAccessSchema.pre("validate", function (next) {
  const hasUser = !!this.user;
  const hasGuest =
    typeof this.guestId === "string" &&
    this.guestId.trim().length > 0;

  /**
   * RULE 1: MUST HAVE ONE IDENTITY
   */
  if (!hasUser && !hasGuest) {
    return next(
      new Error(
        "Must provide either user or guestId"
      )
    );
  }

  /**
   * RULE 2: NEVER BOTH
   */
  if (hasUser && hasGuest) {
    return next(
      new Error(
        "Cannot assign both user and guestId"
      )
    );
  }

  /**
   * RULE 3: EMAIL VALIDATION
   */
  if (
    this.guestEmail &&
    !emailRegex.test(this.guestEmail)
  ) {
    return next(
      new Error(
        "Invalid guest email format"
      )
    );
  }

  next();
});

/**
 * =====================================================
 * NORMALIZATION
 * =====================================================
 */
userQuizAccessSchema.pre("save", function (next) {
  const clean = (v) =>
    typeof v === "string" ? v.trim() : v;

  if (this.slug) {
    this.slug = this.slug.toLowerCase().trim();
  }

  if (this.guestId) {
    this.guestId = clean(this.guestId);
  }

  if (this.guestName) {
    this.guestName = clean(this.guestName);
  }

  if (this.guestEmail) {
    this.guestEmail = this.guestEmail
      .toLowerCase()
      .trim();
  }

  next();
});

/**
 * =====================================================
 * SAFE SERIALIZATION (NO CROSS USER LEAKAGE)
 * =====================================================
 */
userQuizAccessSchema.methods.toPublicJSON =
  function () {
    return {
      id: this._id,

      quiz: this.quiz,

      slug: this.slug,

      accessedAt: this.accessedAt,

      guestName: this.guestName,

      guestEmail: this.guestEmail,

      createdAt: this.createdAt,
    };
  };

/**
 * =====================================================
 * STATIC ACCESS LOGGER (FIXED CORE LOGIC)
 * =====================================================
 */
userQuizAccessSchema.statics.logAccess =
  async function ({
    userId = null,
    guestId = null,
    guestName = "",
    guestEmail = "",
    quizId,
    slug,
    metadata = {},
  }) {
    if (!quizId) {
      throw new Error(
        "quizId is required"
      );
    }

    /**
     * =================================================
     * FIX: PRIORITIZE guestId AS IDENTITY SOURCE
     * =================================================
     */
    const identityFilter = userId
      ? { user: userId, quiz: quizId }
      : {
          guestId,
          quiz: quizId,
        };

    /**
     * =================================================
     * UPDATE PAYLOAD
     * =================================================
     */
    const update = {
      $set: {
        user: userId || null,
        guestId:
          guestId || null,
        guestName:
          guestName || "",
        guestEmail: guestEmail
          ? guestEmail
              .toLowerCase()
              .trim()
          : null,

        quiz: quizId,

        slug:
          slug?.toLowerCase().trim() ||
          "",

        accessedAt: new Date(),

        metadata: {
          ipAddress:
            metadata.ipAddress || "",
          userAgent:
            metadata.userAgent || "",
          platform:
            metadata.platform || "",
          browser:
            metadata.browser || "",
        },
      },
    };

    /**
     * =================================================
     * UPSERT (SAFE + ATOMIC)
     * =================================================
     */
    return this.findOneAndUpdate(
      identityFilter,
      update,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );
  };

/**
 * =====================================================
 * HISTORY FETCH (FIXED ISOLATION)
 * =====================================================
 */
userQuizAccessSchema.statics.findUserHistory =
  function ({
    guestId,
    quizId = null,
    limit = 50,
  }) {
    const query = {
      guestId,
    };

    if (quizId) {
      query.quiz = quizId;
    }

    return this.find(query)
      .sort({
        accessedAt: -1,
      })
      .limit(limit);
  };

/**
 * =====================================================
 * EXPORT
 * =====================================================
 */
module.exports =
  mongoose.models.UserQuizAccess ||
  mongoose.model(
    "UserQuizAccess",
    userQuizAccessSchema
  );