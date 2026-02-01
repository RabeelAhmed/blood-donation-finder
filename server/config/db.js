const mongoose = require('mongoose');

const connectDB = async () => {
  // 1 is 'connected'. 2 is 'connecting'. 
  // We want to wait if it's not fully connected.
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables!");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
