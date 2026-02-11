const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const createTestDonors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Base coordinates from user request
    const baseLat = 32.3986271;
    const baseLng = 74.8356670;

    // Common password
    // Note: The User model pre-save hook handles hashing, so we just pass the plain text password here.
    // However, if we insertMany, hooks might not run depending on mongoose version/options.
    // To be safe and ensure hashing works via the model's pre-save, we'll create them using User.create
    // or manually hash if we used insertMany (but User.create triggers hooks).
    const password = '112233';

    const testDonors = [
      {
        name: 'Test Donor 1 (Exact)',
        email: 'test1@example.com',
        password,
        role: 'donor',
        bloodGroup: 'O+',
        city: 'Sialkot',
        phone: '03001234567',
        availability: true,
        location: {
          type: 'Point',
          coordinates: [baseLng, baseLat] // [lng, lat]
        }
      },
      {
        name: 'Test Donor 2 (North)',
        email: 'test2@example.com',
        password,
        role: 'donor',
        bloodGroup: 'A+',
        city: 'Sialkot',
        phone: '03001234568',
        availability: true,
        location: {
          type: 'Point',
          coordinates: [baseLng, baseLat + 0.01] // ~1.1km North
        }
      },
      {
        name: 'Test Donor 3 (East)',
        email: 'test3@example.com',
        password,
        role: 'donor',
        bloodGroup: 'B-',
        city: 'Sialkot',
        phone: '03001234569',
        availability: true,
        location: {
          type: 'Point',
          coordinates: [baseLng + 0.01, baseLat] // ~1.1km East
        }
      }
    ];

    // Remove existing test users to avoid duplicates
    await User.deleteMany({ email: { $in: testDonors.map(d => d.email) } });
    
    // Use create to trigger pre-save hooks (password hashing)
    await User.create(testDonors);
    
    console.log('Test donors created successfully!');
    
    // Verify distance logic via script
    console.log('Verifying distance...');
    const nearby = await User.find({
      role: 'donor',
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [baseLng, baseLat]
          },
          $maxDistance: 10000 // 10km
        }
      }
    });

    console.log(`Donors found within 10km: ${nearby.length}`);
    nearby.forEach(d => console.log(`- ${d.name} (${d.bloodGroup})`));

  } catch (error) {
    console.error('Error creating test donors:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestDonors();
