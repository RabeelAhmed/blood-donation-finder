const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");
const connectDB = require("../config/db");
const config = require("../config/env");
const logger = require("../utils/logger");
const { initializeSocket } = require("../utils/socketManager");

const app = express();
const server = http.createServer(app);

// ✅ CORS config for Vercel deployment
const allowedOrigins = [
  "https://blood-donation-finder-uzmd.vercel.app", // Vercel frontend
  "http://localhost:5173",
  "http://localhost:5000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

// ✅ Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: false
  }
});

// Initialize socket manager
initializeSocket(io);

// ✅ Simple preflight handling
app.options(/.*/, cors());

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Basic rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Connect to database once at startup (fixes serverless timeout)
connectDB().catch((err) => {
  logger.error("CRITICAL: Initial DB connection failed", { error: err.message });
  logger.error("Server will continue but database operations will fail.");
});

// Routes
const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const requestRoutes = require("../routes/requestRoutes");
const adminRoutes = require("../routes/adminRoutes");
const notificationRoutes = require("../routes/notificationRoutes");

// Mount routes at /api prefix for deployment
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", apiLimiter);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Also mount at root level for backward compatibility
app.use("/auth", authLimiter, authRoutes);
app.use("/users", userRoutes);
app.use("/requests", requestRoutes);
app.use("/admin", adminRoutes);
app.use("/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Blood Donation Finder API is running 🚀");
});

// ✅ Catch-all for undefined routes
app.use((req, res) => {
  logger.warn("404 - NOT FOUND", { method: req.method, url: req.originalUrl });
  res.status(404).json({ 
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    tip: "Check your route definitions in api/index.js",
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error("SERVER ERROR", {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: config.NODE_ENV === "production" ? undefined : err.stack,
  });

  const status = err.status || 500;

  // Basic Mongoose validation / cast error handling
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid data provided",
      details: config.NODE_ENV === "production" ? undefined : err.message,
    });
  }

  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal Server Error" : err.message,
  });
});

// ✅ Local development listener
if (config.NODE_ENV !== "production") {
  server.listen(config.PORT, () => {
    console.log(`Server is running locally on http://localhost:${config.PORT} 🚀`);
  });
}

module.exports = app;