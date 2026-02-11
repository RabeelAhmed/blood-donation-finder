const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const testGeo = async () => {
  await connectDB();

  try {
    // 2. Query nearby donors
    // User location: 32.3986271, 74.8356670
    const lat = 32.3986271;
    const lng = 74.8356670;
    
    console.log(`Querying nearby donors at [${lng}, ${lat}]...`);

    const donors = await User.find({
      role: 'donor',
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: 10000 // 10km
        }
      }
    });

    console.log(`Donors found within 10km of [${lng}, ${lat}]: ${donors.length}`);
    donors.forEach(d => console.log(`- ${d.name} (${d.bloodGroup})`));

    // We expect at least the 3 test donors we created
    const testDonorNames = ['Test Donor 1 (Exact)', 'Test Donor 2 (North)', 'Test Donor 3 (East)'];
    const foundTestDonors = donors.filter(d => testDonorNames.includes(d.name));

    if (foundTestDonors.length >= 3) {
      console.log('SUCCESS: All 3 test donors found!');
    } else {
      console.error(`FAILURE: Found ${foundTestDonors.length}/3 test donors.`);
    }

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

testGeo();
