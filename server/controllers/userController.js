const User = require('../models/User');

// @desc    Get all donors with filters
// @route   GET /api/users/donors
// @access  Public (or Private?)
const getDonors = async (req, res) => {
  try {
    const { bloodGroup, city, availability, isEligible } = req.query;
    let query = { role: 'donor' };

    // Only filter by availability if explicitly requested
    if (availability === 'true') {
        query.availability = true;
    } else if (availability === 'false') {
        query.availability = false;
    }
    // If favorites is true, we might want to see them regardless of general search defaults
    // though bloodGroup and city still apply.

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    
    if (city) {
      query.city = { $regex: city, $options: 'i' }; // Case insensitive
    }

    if (isEligible === 'true') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
        
        query.$or = [
            { lastDonationDate: { $exists: false } },
            { lastDonationDate: null },
            { lastDonationDate: { $lte: threeMonthsAgo } }
        ];
    }

    if (req.query.favorites === 'true' && req.user) {
         // If favorites filter is on, and user has no favorites, return nothing.
         // Otherwise return only favorited donors.
         query._id = { $in: req.user.favorites || [] };
    }

    const donors = await User.find(query).select('-password');
    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.city = req.body.city || user.city;
      user.phone = req.body.phone || user.phone;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      if (user.role === 'donor') {
          user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
          if (req.body.availability !== undefined) {
              user.availability = req.body.availability;
          }
          if (req.body.lastDonationDate) {
              user.lastDonationDate = req.body.lastDonationDate;
          }
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bloodGroup: updatedUser.bloodGroup,
        city: updatedUser.city,
        phone: updatedUser.phone,
        availability: updatedUser.availability,
        token: req.headers.authorization.split(' ')[1] // Keep same token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// @desc    Add a donation record
// @route   POST /api/users/donation
// @access  Private (Donor only)
const addDonation = async (req, res) => {
  try {
    const { date, location, notes } = req.body;
    const user = await User.findById(req.user.id);

    if (user && user.role === 'donor') {
      const newDonation = {
        date: new Date(date),
        location,
        notes
      };

      user.donationHistory.push(newDonation);
      user.lastDonationDate = newDonation.date; // Update last donation date

      const updatedUser = await user.save();

      res.status(200).json({
        donationHistory: updatedUser.donationHistory,
        lastDonationDate: updatedUser.lastDonationDate
      });
    } else {
      res.status(404).json({ message: 'User not found or not a donor' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Toggle favorite donor
// @route   PUT /api/users/favorite/:id
// @access  Private (Patient only)
const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const donorId = req.params.id;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.favorites.includes(donorId)) {
      // Remove
      user.favorites = user.favorites.filter(id => id.toString() !== donorId);
    } else {
      // Add
      user.favorites.push(donorId);
    }

    await user.save();
    
    // Return updated favorites list
    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin') {
        return res.status(403).json({ message: 'Cannot delete admin users' });
      }
      await User.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDonors,
  updateProfile,
  getAllUsers,
  addDonation,
  toggleFavorite,
  deleteUser
};
