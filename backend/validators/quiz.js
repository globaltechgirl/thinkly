"use strict";

const { body, param } = require("express-validator");

/**
 * =====================================================
 * CREATE QUIZ VALIDATION (PRODUCTION SAFE)
 * =====================================================
 */
const createQuizValidator = [
  body("quizName")
    .trim()
    .notEmpty()
    .withMessage("quizName is required")
    .isString()
    .withMessage("quizName must be a string")
    .isLength({ min: 3, max: 200 })
    .withMessage("quizName must be between 3 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("description must be a string")
    .isLength({ max: 2000 })
    .withMessage("description too long (max 2000 characters)"),

  body("questions")
    .isArray({ min: 1 })
    .withMessage("At least 1 question is required"),

  body("questions.*.question")
    .trim()
    .notEmpty()
    .withMessage("Each question must have question text")
    .isString()
    .withMessage("Question must be a string")
    .isLength({ min: 1, max: 500 })
    .withMessage("Question text too long"),

  body("questions.*.options")
    .isArray({ min: 2 })
    .withMessage("Each question must have at least 2 options"),

  body("questions.*.options.*")
    .notEmpty()
    .withMessage("Option cannot be empty")
    .isString()
    .withMessage("Each option must be a string")
    .isLength({ max: 200 })
    .withMessage("Option text too long"),

  body("questions.*.correctOption")
    .notEmpty()
    .withMessage("Each question must have a correct answer")
    .isInt({ min: 0 })
    .withMessage("correctOption must be a number (index)"),
];

/**
 * =====================================================
 * UPDATE QUIZ VALIDATION (PARTIAL UPDATE SAFE)
 * =====================================================
 */
const updateQuizValidator = [
  body("quizName")
    .optional()
    .trim()
    .isString()
    .withMessage("quizName must be string")
    .isLength({ min: 3, max: 200 })
    .withMessage("quizName must be between 3 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("description must be string")
    .isLength({ max: 2000 })
    .withMessage("description too long"),

  body("questions")
    .optional()
    .isArray()
    .withMessage("questions must be an array"),

  body("questions.*.question")
    .optional()
    .isString()
    .withMessage("question must be a string"),

  body("questions.*.options")
    .optional()
    .isArray()
    .withMessage("options must be an array"),
];

/**
 * =====================================================
 * QUIZ ID VALIDATION (FLEXIBLE ROUTING SAFE)
 * =====================================================
 */
const quizIdValidator = [
  param("id")
    .optional()
    .isMongoId()
    .withMessage("Invalid quiz id"),

  param("quizId")
    .optional()
    .isMongoId()
    .withMessage("Invalid quizId format"),
];

/**
 * =====================================================
 * ATTEMPT ID VALIDATION (STRICT)
 * =====================================================
 */
const attemptIdValidator = [
  param("attemptId")
    .notEmpty()
    .withMessage("attemptId is required")
    .isMongoId()
    .withMessage("Invalid attempt id format"),
];

module.exports = {
  createQuizValidator,
  updateQuizValidator,
  quizIdValidator,
  attemptIdValidator,
};