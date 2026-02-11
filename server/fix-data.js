const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const fixData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Update users where location.coordinates is missing
    const result = await User.updateMany(
      { 
        $or: [
            { location: { $exists: false } },
            { "location.coordinates": { $exists: false } },
            { "location.coordinates": { $size: 0 } }
        ]
      },
      { 
        $set: { 
          location: { 
            type: 'Point', 
            coordinates: [74.3587, 31.5204] // Default to Lahore coordinates
          } 
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} users with default location.`);

  } catch (error) {
    console.error('Error fixing data:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixData();
