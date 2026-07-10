const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

/**
 * =====================================================
 * APP + SERVER INIT
 * =====================================================
 */
const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

/**
 * =====================================================
 * ENV CHECK
 * =====================================================
 */
if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

/**
 * =====================================================
 * ALLOWED ORIGINS
 * =====================================================
 */
const allowedOrigins = [
  "http://localhost:5173",
  "https://thiinkly.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

/**
 * =====================================================
 * CORS CONFIG
 * =====================================================
 */
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn("Blocked CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-device-id",
    "x-guest-id",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * =====================================================
 * MIDDLEWARE
 * =====================================================
 */
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * =====================================================
 * SOCKET.IO SETUP
 * =====================================================
 */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-device-id",
      "x-guest-id",
    ],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("joinQuiz", (quizId) => {
    if (quizId) socket.join(`quiz:${quizId}`);
  });

  socket.on("leaveQuiz", (quizId) => {
    if (quizId) socket.leave(`quiz:${quizId}`);
  });

  socket.on("joinUser", (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
  });
});

app.set("io", io);

/**
 * =====================================================
 * ROUTES
 * =====================================================
 */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/uploads", require("./routes/upload"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/attempts", require("./routes/attempt"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/play", require("./routes/play"));

/**
 * =====================================================
 * HEALTH CHECK
 * =====================================================
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

/**
 * =====================================================
 * STATIC FILES
 * =====================================================
 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/**
 * =====================================================
 * 404 HANDLER
 * =====================================================
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * =====================================================
 * GLOBAL ERROR HANDLER
 * =====================================================
 */
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

/**
 * =====================================================
 * DATABASE CONNECTION
 * =====================================================
 */
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.log("Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

/**
 * =====================================================
 * FIX: SAFE SERVER START (EADDRINUSE HANDLING)
 * =====================================================
 */
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5001;

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${PORT} is in use. Trying ${PORT + 1}...`);

      server.listen(PORT + 1, () => {
        console.log(`Server running on fallback port ${PORT + 1}`);
      });
    } else {
      console.error("Server error:", err);
    }
  });
};

startServer();

/**
 * =====================================================
 * GRACEFUL SHUTDOWN
 * =====================================================
 */
process.on("SIGINT", async () => {
  console.log("Graceful shutdown initiated...");

  await mongoose.connection.close();
  console.log("MongoDB disconnected");

  process.exit(0);
});

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */
module.exports = {
  app,
  server,
  io,
};
