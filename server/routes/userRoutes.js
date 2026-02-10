const express = require('express');
const router = express.Router();
const { getDonors, updateProfile, getAllUsers, addDonation, toggleFavorite, deleteUser } = require('../controllers/userController');
const { protect, admin, optionalProtect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  donorsQueryValidation,
  updateProfileValidation,
  addDonationValidation,
  toggleFavoriteValidation,
} = require('../utils/validation');

router.get('/donors', optionalProtect, donorsQueryValidation, validate, getDonors);
router.post('/donation', protect, addDonationValidation, validate, addDonation);
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);
router.put('/favorite/:id', protect, toggleFavoriteValidation, validate, toggleFavorite);
router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
