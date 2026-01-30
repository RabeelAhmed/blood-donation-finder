const User = require('../models/User');
const Request = require('../models/Request');

// @desc    Get Admin Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const activeRequests = await Request.countDocuments({ status: 'pending' });
    const successDonations = await Request.countDocuments({ status: 'accepted' });

    res.status(200).json({
      totalDonors,
      totalPatients,
      activeRequests,
      successDonations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats
};
