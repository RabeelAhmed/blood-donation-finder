const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("../config/db");

dotenv.config();

const app = express();

// ✅ Connect DB (Avoid blocking initialization)
connectDB().catch(err => console.error("Database connection failed:", err.message));

// ✅ CORS config
const allowedOrigins = ["https://donor-finder.netlify.app", "http://localhost:5173"];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Handle preflight
app.options("*", cors());

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const requestRoutes = require("../routes/requestRoutes");
const adminRoutes = require("../routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Blood Donation Finder API is running 🚀");
});

// Error handler
app.use((err, req, res, next) => {
  res.status(res.statusCode || 500).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
});

module.exports = app;
