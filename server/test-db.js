const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing connection to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas! ✅');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB Atlas! ❌');
    console.error('Error Details:', err.message);
    process.exit(1);
  });
