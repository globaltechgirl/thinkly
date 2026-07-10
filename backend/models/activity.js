const mongoose = require("mongoose");

/**
 * =====================================================
 * ACTIVITY TYPES
 * =====================================================
 */
const ACTIVITY_TYPES = Object.freeze([
  "STARTED",
  "SUBMITTED",
  "UPDATED",
  "PUBLISHED",
  "DELETED",
]);

const normalizeType = (type) =>
  String(type || "")
    .trim()
    .toUpperCase();

/**
 * =====================================================
 * SCHEMA
 * =====================================================
 */
const ActivityLogSchema = new mongoose.Schema(
  {
    /**
     * =================================================
     * ADMIN OWNER
     * =================================================
     */
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * =================================================
     * USER OWNER
     * =================================================
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    /**
     * =================================================
     * CORE IDENTITY
     * IMPORTANT:
     * guestId is the REAL identity layer
     * =================================================
     */
    guestId: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
      index: true,
    },

    /**
     * =================================================
     * QUIZ RELATION
     * =================================================
     */
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    /**
     * =================================================
     * TYPE
     * =================================================
     */
    type: {
      type: String,
      required: true,
      index: true,
      set: normalizeType,
    },

    /**
     * =================================================
     * MESSAGE
     * =================================================
     */
    message: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    /**
     * =================================================
     * META
     * =================================================
     */
    meta: {
      fullName: {
        type: String,
        default: "",
        trim: true,
      },

      quizTitle: {
        type: String,
        default: "",
        trim: true,
      },

      role: {
        type: String,
        default: "user",
        trim: true,
      },

      email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },
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

        return ret;
      },
    },

    toObject: {
      virtuals: true,
    },
  }
);

/**
 * =====================================================
 * INDEXES
 * =====================================================
 */

/**
 * USER HISTORY
 */
ActivityLogSchema.index({
  guestId: 1,
  createdAt: -1,
});

/**
 * QUIZ + USER HISTORY
 */
ActivityLogSchema.index({
  quiz: 1,
  guestId: 1,
  createdAt: -1,
});

/**
 * ADMIN DASHBOARD
 */
ActivityLogSchema.index({
  admin: 1,
  createdAt: -1,
});

/**
 * QUIZ DASHBOARD
 */
ActivityLogSchema.index({
  quiz: 1,
  createdAt: -1,
});

/**
 * TYPE FILTERING
 */
ActivityLogSchema.index({
  type: 1,
  createdAt: -1,
});

/**
 * SECURE USER ISOLATION
 */
ActivityLogSchema.index({
  quiz: 1,
  guestId: 1,
  type: 1,
  createdAt: -1,
});

/**
 * =====================================================
 * VALIDATION
 * =====================================================
 */
ActivityLogSchema.pre("validate", function (next) {
  try {
    const normalized = normalizeType(
      this.type
    );

    if (
      !ACTIVITY_TYPES.includes(
        normalized
      )
    ) {
      return next(
        new Error(
          `Invalid activity type: ${this.type}`
        )
      );
    }

    this.type = normalized;

    /**
     * guestId REQUIRED ALWAYS
     */
    if (
      !this.guestId ||
      typeof this.guestId !== "string" ||
      !this.guestId.trim()
    ) {
      return next(
        new Error(
          "guestId is required"
        )
      );
    }

    this.guestId =
      this.guestId.trim();

    /**
     * REQUIRED RELATIONS
     */
    if (!this.admin || !this.quiz) {
      return next(
        new Error(
          "admin and quiz are required"
        )
      );
    }

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * =====================================================
 * SAFE SERIALIZATION
 * NEVER LEAK OTHER USERS
 * =====================================================
 */
ActivityLogSchema.methods.toPublicJSON =
  function () {
    return {
      id: this._id,

      quiz: this.quiz,

      type: this.type,

      message: this.message,

      meta: {
        fullName:
          this.meta?.fullName || "",
        quizTitle:
          this.meta?.quizTitle || "",
        role:
          this.meta?.role || "user",
      },

      createdAt: this.createdAt,

      updatedAt: this.updatedAt,
    };
  };

/**
 * =====================================================
 * MESSAGE GENERATOR
 * =====================================================
 */
ActivityLogSchema.methods.generateMessage =
  function () {
    const name =
      this.meta?.fullName || "User";

    const quiz =
      this.meta?.quizTitle || "Quiz";

    const map = {
      STARTED: `${name} started ${quiz}`,

      SUBMITTED: `${name} submitted ${quiz}`,

      UPDATED: `${quiz} was updated`,

      PUBLISHED: `${quiz} was published`,

      DELETED: `${quiz} was deleted`,
    };

    return (
      map[this.type] ||
      `${name} interacted with ${quiz}`
    );
  };

/**
 * =====================================================
 * STATIC LOGGER
 * =====================================================
 */
ActivityLogSchema.statics.log =
  async function ({
    admin,
    user = null,
    guestId,
    quiz,
    type,
    fullName = "User",
    quizTitle = "Untitled Quiz",
    email = "",
    preventDuplicate = false,
  }) {
    try {
      /**
       * REQUIRED FIELDS
       */
      if (
        !admin ||
        !quiz ||
        !type ||
        !guestId
      ) {
        throw new Error(
          "Missing required fields"
        );
      }

      const normalizedType =
        normalizeType(type);

      if (
        !ACTIVITY_TYPES.includes(
          normalizedType
        )
      ) {
        throw new Error(
          `Invalid activity type: ${type}`
        );
      }

      const safeGuestId =
        String(guestId).trim();

      if (!safeGuestId) {
        throw new Error(
          "Invalid guestId"
        );
      }

      const name = String(
        fullName || "User"
      ).trim();

      const title = String(
        quizTitle || "Untitled Quiz"
      ).trim();

      const safeEmail = String(
        email || ""
      )
        .trim()
        .toLowerCase();

      /**
       * MESSAGE MAP
       */
      const messageMap = {
        STARTED: `${name} started ${title}`,

        SUBMITTED: `${name} submitted ${title}`,

        UPDATED: `${title} was updated`,

        PUBLISHED: `${title} was published`,

        DELETED: `${title} was deleted`,
      };

      const message =
        messageMap[
          normalizedType
        ] ||
        `${name} interacted with ${title}`;

      /**
       * =================================================
       * DEDUP MODE
       * =================================================
       */
      if (preventDuplicate) {
        return this.findOneAndUpdate(
          {
            admin,
            guestId: safeGuestId,
            quiz,
            type: normalizedType,

            createdAt: {
              $gte: new Date(
                Date.now() - 5000
              ),
            },
          },

          {
            $setOnInsert: {
              admin,
              user,
              guestId: safeGuestId,
              quiz,
              type: normalizedType,
              message,

              meta: {
                fullName: name,
                quizTitle: title,
                role: "user",
                email: safeEmail,
              },
            },
          },

          {
            upsert: true,
            new: true,
          }
        );
      }

      /**
       * =================================================
       * NORMAL CREATE
       * =================================================
       */
      const doc =
        await this.create({
          admin,
          user,
          guestId: safeGuestId,
          quiz,
          type: normalizedType,
          message,

          meta: {
            fullName: name,
            quizTitle: title,
            role: "user",
            email: safeEmail,
          },
        });

      return doc;
    } catch (error) {
      console.error(
        "[ActivityLog ERROR]",
        error.message
      );

      return null;
    }
  };

/**
 * =====================================================
 * USER HISTORY
 * IMPORTANT:
 * Prevents users from seeing
 * other users activities
 * =====================================================
 */
ActivityLogSchema.statics.findUserActivity =
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
        createdAt: -1,
      })
      .limit(limit);
  };

/**
 * =====================================================
 * QUIZ ACTIVITY
 * =====================================================
 */
ActivityLogSchema.statics.findQuizActivity =
  function ({
    quizId,
    type = null,
    limit = 100,
  }) {
    const query = {
      quiz: quizId,
    };

    if (type) {
      query.type =
        normalizeType(type);
    }

    return this.find(query)
      .sort({
        createdAt: -1,
      })
      .limit(limit);
  };

/**
 * =====================================================
 * USER ANALYTICS
 * =====================================================
 */
ActivityLogSchema.statics.getGuestAnalytics =
  async function (guestId) {
    const results =
      await this.aggregate([
        {
          $match: {
            guestId,
          },
        },

        {
          $group: {
            _id: "$guestId",

            totalActivities: {
              $sum: 1,
            },

            quizzesStarted: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$type",
                      "STARTED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            quizzesSubmitted: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$type",
                      "SUBMITTED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    return results[0] || null;
  };

/**
 * =====================================================
 * EXPORT
 * =====================================================
 */

module.exports =
  mongoose.models.ActivityLog ||
  mongoose.model(
    "ActivityLog",
    ActivityLogSchema
  );