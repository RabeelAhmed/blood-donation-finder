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

    // Blood Group Stats
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const bloodGroupStats = {};
    for (const group of bloodGroups) {
      bloodGroupStats[group] = await User.countDocuments({ role: 'donor', bloodGroup: group });
    }

    // Recent Requests
    const recentRequests = await Request.find()
      .populate('patientId', 'name email')
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalDonors,
      totalPatients,
      activeRequests,
      successDonations,
      bloodGroupStats,
      recentRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats
};
