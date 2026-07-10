const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("joinQuiz", (quizId) => {
      if (!quizId) return;

      socket.join(`quiz:${quizId}`);
      console.log(`Socket ${socket.id} joined quiz:${quizId}`);
    });

    socket.on("leaveQuiz", (quizId) => {
      if (!quizId) return;

      socket.leave(`quiz:${quizId}`);
      console.log(`Socket ${socket.id} left quiz:${quizId}`);
    });

    socket.on("joinUser", (userId) => {
      if (!userId) return;

      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * =====================================================
 * GET IO INSTANCE
 * =====================================================
 */
const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

/**
 * =====================================================
 * EMIT LEADERBOARD UPDATE 
 * =====================================================
 */
const emitLeaderboardUpdate = (quizId, leaderboardData) => {
  if (!io) return;

  io.to(`quiz:${quizId}`).emit("leaderboardUpdate", {
    quizId,
    leaderboard: leaderboardData,
    timestamp: new Date(),
  });
};

/**
 * =====================================================
 * EMIT QUIZ UPDATE (GENERIC)
 * =====================================================
 */
const emitQuizUpdate = (quizId, payload) => {
  if (!io) return;

  io.to(`quiz:${quizId}`).emit("quizUpdate", payload);
};

module.exports = {
  initSocket,
  getIO,
  emitLeaderboardUpdate,
  emitQuizUpdate,
};