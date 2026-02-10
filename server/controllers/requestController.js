const Request = require('../models/Request');
const User = require('../models/User');

// @desc    Create a blood request
// @route   POST /api/requests
// @access  Private (Patient only)
const createRequest = async (req, res) => {
  try {
    const { donorId, bloodGroup, message } = req.body;

    // Enforce that only patients can create requests
    if (!req.user || req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can create blood requests' });
    }

    const donor = await User.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    if (donor.role !== 'donor') {
      return res.status(400).json({ message: 'User is not a donor' });
    }

    const request = await Request.create({
      patientId: req.user.id,
      donorId,
      bloodGroup,
      message,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get requests for current user (Patient or Donor)
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'donor') {
      query.donorId = req.user.id;
    } else {
      query.patientId = req.user.id;
    }

    const requests = await Request.find(query)
      .populate('patientId', 'name email phone')
      .populate('donorId', 'name email phone bloodGroup city')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id
// @access  Private (Donor only)
const updateRequestStatus = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (!req.user || req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only the donor can update the request status' });
    }

    if (request.donorId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    request.status = req.body.status || request.status;
    const updatedRequest = await request.save();

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  updateRequestStatus,
};
