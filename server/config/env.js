const dotenv = require("dotenv");

// Load environment variables from .env file once, as early as possible
dotenv.config();

const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET"];

REQUIRED_VARS.forEach((key) => {
  if (!process.env[key]) {
    // Fail fast with a clear message during startup
    // This avoids running the app with insecure or broken configuration.
    throw new Error(`Environment variable ${key} is required but was not found. Please set it in your .env file.`);
  }
});

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
};

module.exports = config;

