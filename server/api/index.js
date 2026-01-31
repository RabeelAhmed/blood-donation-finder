const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const requestRoutes = require('../routes/requestRoutes');
const adminRoutes = require('../routes/adminRoutes');

// Support both /api/auth and /auth
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

app.use('/api/requests', requestRoutes);
app.use('/requests', requestRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.get("/", (req, res) => {
  res.send("Blood Donation Finder API is running 🚀");
});


// Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
