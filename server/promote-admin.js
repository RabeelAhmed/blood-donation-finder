const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const promoteToAdmin = async (email) => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('ERROR: MONGO_URI not found in .env file');
      process.exit(1);
    }

    if (!email || typeof email !== 'string') {
      console.error('Usage: node promote-admin.js user@example.com');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.error(`User with email ${normalizedEmail} not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`SUCCESS: User ${normalizedEmail} has been promoted to Admin!`);
    console.log('You can now log in and access the Admin Dashboard.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error promoting user:', error.message);
    process.exit(1);
  }
};

const [, , emailArg] = process.argv;
promoteToAdmin(emailArg);
