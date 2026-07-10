const sendError = require("../utils/sendError");

const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);

    return sendError(res, 400, "Validation Error", errors);
  }

  if (err.code === 11000) {
    return sendError(res, 409, "Duplicate field value");
  }

  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token expired");
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  return sendError(res, status, message);
};

module.exports = errorHandler;