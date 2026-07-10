const { app, connectDB } = require("./server");

let isDbConnected = false;

const ensureDbConnection = async () => {
  if (isDbConnected) return;

  await connectDB();
  isDbConnected = true;
};

module.exports = async (req, res) => {
  await ensureDbConnection();
  app(req, res);
};
