const { body, query, param } = require("express-validator");
const mongoose = require("mongoose");

// Escape user input for use in a regex to avoid ReDoS and unintended patterns.
const escapeRegex = (value) => {
  if (!value || typeof value !== "string") return value;
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Common validators
const emailValidator = body("email").isEmail().withMessage("Valid email is required").normalizeEmail();

const passwordValidator = body("password")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters long");

const optionalPasswordValidator = body("password")
  .optional()
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters long when provided");

const objectIdParam = (name) =>
  param(name)
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(`${name} must be a valid ID`);

// Auth validators
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  emailValidator,
  passwordValidator,
  body("city").trim().notEmpty().withMessage("City is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("role")
    .optional()
    .isIn(["donor", "patient", "admin"])
    .withMessage("Role must be donor, patient, or admin"),
  body("bloodGroup")
    .optional()
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .withMessage("Invalid blood group"),
];

const loginValidation = [emailValidator, passwordValidator];

// User validators
const donorsQueryValidation = [
  query("city")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("City must be a string up to 50 characters")
    .customSanitizer(escapeRegex),
  query("bloodGroup")
    .optional()
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .withMessage("Invalid blood group"),
  query("availability").optional().isIn(["true", "false"]),
  query("isEligible").optional().isIn(["true", "false"]),
  query("favorites").optional().isIn(["true", "false"]),
];

const updateProfileValidation = [
  body("email").optional().isEmail().withMessage("Email must be valid").normalizeEmail(),
  body("phone").optional().isString().isLength({ max: 20 }).withMessage("Phone must be a valid string"),
  body("name").optional().isString().isLength({ max: 100 }),
  body("city").optional().isString().isLength({ max: 50 }),
  optionalPasswordValidator,
  body("bloodGroup")
    .optional()
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .withMessage("Invalid blood group"),
];

const addDonationValidation = [
  body("date").notEmpty().withMessage("Date is required").isISO8601().toDate(),
  body("location").trim().notEmpty().withMessage("Location is required").isLength({ max: 200 }),
  body("notes").optional().isString().isLength({ max: 500 }),
];

const toggleFavoriteValidation = [objectIdParam("id")];

// Request validators
const createRequestValidation = [
  body("donorId")
    .notEmpty()
    .withMessage("donorId is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("donorId must be a valid ID"),
  body("bloodGroup")
    .notEmpty()
    .withMessage("Blood group is required")
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .withMessage("Invalid blood group"),
  body("message").optional().isString().isLength({ max: 500 }),
];

const updateRequestStatusValidation = [
  param("id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Request ID must be a valid ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "accepted", "rejected"])
    .withMessage("Status must be pending, accepted, or rejected"),
];

module.exports = {
  registerValidation,
  loginValidation,
  donorsQueryValidation,
  updateProfileValidation,
  addDonationValidation,
  toggleFavoriteValidation,
  createRequestValidation,
  updateRequestStatusValidation,
};

