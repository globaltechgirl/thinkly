"use strict";

const { validationResult } = require("express-validator");

/**
 * =====================================================
 * VALIDATION RESULT HANDLER (PRODUCTION READY)
 * =====================================================
 * - Standardizes error format
 * - Avoids leaking sensitive debug data in production
 * - Compatible with express-validator v6/v7
 * - Safe for async pipelines
 */
const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const formattedErrors = result.array({
      onlyFirstError: true,
    });

    /**
     * =====================================================
     * DEV-ONLY DEBUGGING
     * =====================================================
     */
    if (process.env.NODE_ENV !== "production") {
      console.error("❌ Validation Error");
      console.error("Route:", `${req.method} ${req.originalUrl}`);
      console.error("Params:", req.params);
      console.error("Query:", req.query);
      console.error("Body:", req.body);
      console.error("Errors:", formattedErrors);
    }

    /**
     * =====================================================
     * SAFE ERROR RESPONSE (CLIENT-FRIENDLY)
     * =====================================================
     */
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors.map((err) => ({
        field: err.path || err.param || "unknown",
        message: err.msg,
        value: err.value,
      })),
    });
  }

  return next();
};

module.exports = {
  validateRequest,
};