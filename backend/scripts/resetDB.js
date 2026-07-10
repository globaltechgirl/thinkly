require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/user");
const Quiz = require("../models/quiz");
const { Attempt } = require("../models/attempt");
const ActivityLog = require("../models/activity");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing in .env");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Connection Error:", err.message);
    process.exit(1);
  }
};

const resetDB = async () => {
  try {
    console.log("Clearing database...");

    await Promise.all([
      User.deleteMany({}),
      Quiz.deleteMany({}),
      Attempt.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    console.log("Database cleared successfully");
  } catch (err) {
    console.error("Error clearing DB:", err.message);
  }
};

const run = async () => {
  await connectDB();
  await resetDB();

  await mongoose.connection.close();
  console.log("MongoDB connection closed");

  process.exit(0);
};

run();