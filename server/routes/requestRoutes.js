const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  createRequestValidation,
  updateRequestStatusValidation,
} = require('../utils/validation');

router
  .route('/')
  .post(protect, createRequestValidation, validate, createRequest)
  .get(protect, getRequests);

router
  .route('/:id')
  .put(protect, updateRequestStatusValidation, validate, updateRequestStatus);

module.exports = router;
