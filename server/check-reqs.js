const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Request = require('./models/Request');

dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    const users = await User.countDocuments();
    const requests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    
    console.log('Total Users:', users);
    console.log('Total Requests:', requests);
    console.log('Pending Requests:', pendingRequests);
    
    const sampleReqs = await Request.find().limit(5);
    console.log('Sample Requests:', JSON.stringify(sampleReqs, null, 2));
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
