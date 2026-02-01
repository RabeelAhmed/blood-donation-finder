const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const Request = require('./models/Request');
const connectDB = require('./config/db');

dotenv.config();

const runDiag = async () => {
  try {
    await connectDB();
    console.log('--- DB CONNECTION SUCCESS ---');
    
    const uCount = await User.countDocuments();
    const rCount = await Request.countDocuments();
    console.log('Users in DB:', uCount);
    console.log('Requests in DB:', rCount);
    
    if (rCount > 0) {
      const q = await Request.find().populate('patientId donorId').limit(3);
      console.log('Sample Requests data:', JSON.stringify(q, null, 2));
    } else {
      console.log('No blood requests found in Request collection.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('DIAGNOSTIC ERROR:', err);
    process.exit(1);
  }
};

runDiag();
