const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    
    // Delete the user with invalid location data
    const result = await mongoose.connection.db.collection('users').deleteOne({
      email: 'ahmed@gmail.com'
    });
    
    console.log('Deleted user:', result.deletedCount);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

connectDB();
