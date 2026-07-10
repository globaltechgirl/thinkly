"use strict";

const mongoose = require("mongoose");
const Quiz = require("../models/quiz");
const { Attempt, ATTEMPT_STATES } = require("../models/attempt");
const ActivityLog = require("../models/activity");
const User = require("../models/user");
const { getIO } = require("../socket/index");
const { getQuizLeaderboard } = require("./leaderboard");

/**
 * =====================================================
 * HELPERS
 * =====================================================
 */
const toStr = (v) => (v ? v.toString() : "");

/**
 * Identity resolver (CRITICAL FIX FOR GUEST SYSTEM)
 * Treats guestId as first-class identity key.
 */
const resolveIdentityQuery = ({ userId, guestId }) => {
  if (guestId) {
    return { guestId };
  }

  if (userId) {
    return { guestId: `user_${userId}` };
  }

  throw new Error("No valid identity provided");
};

const resolveIdentityMatch = (a, b) => toStr(a) === toStr(b);

const getGuestProfile = async (guestId) => {
  if (!guestId) return { fullName: null, email: null };

  const user = await User.findOne({ guestId }).select("fullName email").lean();

  return {
    fullName: user?.fullName || null,
    email: user?.email || null,
  };
};

/**
 * Determines ownership safely
 */
const isOwner = (quiz, userId) => toStr(quiz?.createdBy) === toStr(userId);

/**
 * =====================================================
 * VALIDATION
 * =====================================================
 */
const assertCanTakeQuiz = (quiz, userId) => {
  if (!quiz) throw new Error("Quiz not found");

  if (userId && isOwner(quiz, userId)) {
    throw new Error("Quiz owners cannot participate");
  }

  if ((quiz.status || "").toUpperCase() !== "PUBLISHED") {
    throw new Error("Quiz is not published");
  }

  if (quiz.runtimeStatus && quiz.runtimeStatus !== "ACTIVE") {
    throw new Error("Quiz is not active");
  }

  if (quiz.endTime && new Date() > new Date(quiz.endTime)) {
    throw new Error("Quiz has expired");
  }
};

/**
 * =====================================================
 * CORE SUBMIT ATTEMPT (FIXED IDENTITY ISOLATION)
 * =====================================================
 */
exports.submitAttempt = async (
  quizId,
  userId,
  answers = {},
  guestId = null,
  guestFullName = null,
  guestEmail = null,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const finalUserId = userId || null;
    let finalGuestId = guestId || null;

    if (finalUserId && !finalGuestId) {
      finalGuestId = `user_${finalUserId}`;
    }

    if (!finalGuestId) {
      throw new Error("Invalid identity: guestId required");
    }

    /**
     * =====================================================
     * LOAD QUIZ
     * =====================================================
     */
    const quiz = await Quiz.findById(quizId).session(session);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    assertCanTakeQuiz(quiz, finalUserId);

    /**
     * =====================================================
     * STRICT IDENTITY QUERY (FIX FOR CROSS USER LEAKAGE)
     * =====================================================
     */
    const identityQuery = resolveIdentityQuery({
      userId: finalUserId,
      guestId: finalGuestId,
    });

    const attemptQuery = {
      quiz: quizId,
      ...identityQuery,
    };

    let attempt = await Attempt.findOne(attemptQuery).session(session);

    if (!attempt) {
      const attemptData = {
        quiz: quizId,
        status: ATTEMPT_STATES.IN_PROGRESS,
        startedAt: new Date(),
        answers: {},
        score: 0,
        totalScore: 0,
        percentage: 0,
        breakdown: [],
      };

      if (finalUserId) {
        attemptData.user = finalUserId;
      }

      if (finalGuestId) {
        attemptData.guestId = finalGuestId;
      }

      attempt = (await Attempt.create([attemptData], { session }))[0];

      try {
        const actor = finalUserId
          ? await User.findById(finalUserId).select("fullName").lean()
          : null;

        await ActivityLog.log({
          admin: quiz.createdBy,
          user: finalUserId,
          guestId: finalGuestId || null,
          quiz: quizId,
          type: "STARTED",
          fullName: actor?.fullName || (finalUserId ? "User" : "Guest User"),
          quizTitle: quiz.quizName || "Untitled Quiz",
          preventDuplicate: true,
        });
      } catch (logErr) {
        // Intentionally non-blocking; analytics can fall back to existing attempts.
      }
    }

    if (attempt.status === ATTEMPT_STATES.SUBMITTED) {
      throw new Error("Quiz already submitted");
    }

    /**
     * =====================================================
     * SCORING ENGINE
     * =====================================================
     */
    const questions = quiz.questions || [];

    let score = 0;
    let totalScore = 0;

    const breakdown = questions.map((q, index) => {
      const selected = answers?.[index];
      const correct = q.correctOption;
      const points = q.points || 1;

      const isCorrect = selected === correct;

      totalScore += points;
      if (isCorrect) score += points;

      return {
        questionIndex: index,
        selectedOption: selected ?? null,
        correctOption: correct,
        isCorrect,
        points,
      };
    });

    const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;

    /**
     * =====================================================
     * UPDATE ATTEMPT
     * =====================================================
     */
    attempt.answers = answers;
    attempt.score = score;
    attempt.totalScore = totalScore;
    attempt.percentage = percentage;
    attempt.breakdown = breakdown;
    attempt.status = ATTEMPT_STATES.SUBMITTED;
    attempt.submittedAt = new Date();
    attempt.resultLocked = true;

    /**
     * =====================================================
     * POPULATE GUEST SNAPSHOT (CRITICAL FIX)
     * =====================================================
     * Capture guest name and email at submission time.
     * If the guest is identified only by guestId, resolve the stored
     * guest account profile so leaderboard entries keep the entered name.
     */
    let resolvedGuestFullName = guestFullName?.trim() || null;
    let resolvedGuestEmail = guestEmail?.trim().toLowerCase() || null;

    if (finalGuestId && !resolvedGuestFullName) {
      const profile = await getGuestProfile(finalGuestId);
      resolvedGuestFullName = profile.fullName || null;
      resolvedGuestEmail = profile.email || null;
    }

    if (finalGuestId && !attempt.guestSnapshot?.fullName) {
      attempt.guestSnapshot = {
        fullName: resolvedGuestFullName || "Guest",
        email: resolvedGuestEmail || "",
      };
    }

    await attempt.save({ session });

    /**
     * =====================================================
     * UPDATE QUIZ STATS (SAFE AGGREGATION)
     * =====================================================
     */
    quiz.totalAttempts = (quiz.totalAttempts || 0) + 1;

    const prevAvg = quiz.averageScore || 0;
    const prevCount = quiz.totalAttempts - 1;

    quiz.averageScore =
      prevCount > 0
        ? (prevAvg * prevCount + percentage) / quiz.totalAttempts
        : percentage;

    await quiz.save({ session });

    /**
     * =====================================================
     * ACTIVITY LOG (NON-BLOCKING)
     * =====================================================
     */
    try {
      const actor = finalUserId
        ? await User.findById(finalUserId).select("fullName").lean()
        : null;

      await ActivityLog.log({
        admin: quiz.createdBy,
        user: finalUserId,
        guestId: finalGuestId || null,
        quiz: quizId,
        type: "SUBMITTED",
        fullName: actor?.fullName || (finalUserId ? "User" : "Guest User"),
        quizTitle: quiz.quizName || "Untitled Quiz",
        preventDuplicate: true,
      });
    } catch (e) {
      // Intentionally non-blocking so quiz submission still succeeds.
    }

    await session.commitTransaction();

    /**
     * =====================================================
     * SOCKET UPDATE
     * =====================================================
     */
    try {
      const io = getIO();
      const leaderboard = await getQuizLeaderboard(quizId);

      io.to(`quiz:${quizId}`).emit("leaderboardUpdate", {
        quizId,
        leaderboard,
        timestamp: new Date(),
      });
    } catch (e) {}

    return await Attempt.findById(attempt._id).lean();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

exports.getUserAttempts = async (identity) => {
  const query = resolveIdentityQuery(identity);
  return Attempt.find(query).sort({ createdAt: -1 }).lean();
};

exports.getAttempt = async (attemptId, identity) => {
  const query = { _id: attemptId, ...resolveIdentityQuery(identity) };
  return Attempt.findOne(query).lean();
};

exports.deleteAttempt = async (attemptId, identity) => {
  const query = { _id: attemptId, ...resolveIdentityQuery(identity) };
  const deleted = await Attempt.findOneAndDelete(query).lean();

  if (!deleted) {
    throw new Error("Attempt not found or not authorized");
  }

  return deleted;
};

exports.getQuizAttempts = async (quizId) => {
  return Attempt.find({ quiz: quizId }).sort({ createdAt: -1 }).lean();
};

exports.getAllAdminAttempts = async () => {
  return Attempt.find().sort({ createdAt: -1 }).lean();
};
