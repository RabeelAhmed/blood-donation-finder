const express = require('express');
const router = express.Router();
const { getDonors, getNearbyDonors, updateProfile, getAllUsers, addDonation, toggleFavorite, deleteUser, updateLocation } = require('../controllers/userController');
const { protect, admin, optionalProtect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  donorsQueryValidation,
  updateProfileValidation,
  addDonationValidation,
  toggleFavoriteValidation,
} = require('../utils/validation');

router.get('/nearby', getNearbyDonors);
router.get('/donors', optionalProtect, donorsQueryValidation, validate, getDonors);
router.post('/donation', protect, addDonationValidation, validate, addDonation);
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);
router.put('/location', protect, updateLocation);
router.put('/favorite/:id', protect, toggleFavoriteValidation, validate, toggleFavorite);
router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
