const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("../config/db");

dotenv.config();

const app = express();



// ✅ CORS config
const allowedOrigins = ["https://donor-finder.netlify.app", "http://localhost:5173"];
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Handle preflight (Using middleware to avoid Express 5 PathError)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ MONGO_URI sanity check
if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('.mongodb.net/')) {
  console.warn("WARNING: MONGO_URI might be missing the database name or incorrectly formatted.");
}
const maskedURI = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/\/\/.*@/, "//***:***@") : "UNDEFINED";
console.log(`[${new Date().toISOString()}] Server initializing with URI: ${maskedURI}`);

// ✅ Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Checking DB...`);
  try {
    await connectDB();
    console.log(`[${new Date().toISOString()}] DB Connected for ${req.originalUrl}`);
    next();
  } catch (err) {
    console.error(`[${new Date().toISOString()}] CRITICAL: DB connection failed for ${req.originalUrl}`, err);
    res.status(500).json({ 
      message: "Database connection failed", 
      error: err.message,
      path: req.originalUrl,
      tip: "Check your MONGO_URI and Atlas IP Whitelist"
    });
  }
});

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

// ✅ Catch-all for undefined routes
app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] 404 - NOT FOUND: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    tip: "Check your route definitions in api/index.js"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err
  });
});

// ✅ Local development listener
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running locally on http://localhost:${PORT} 🚀`);
  });
}

module.exports = app;