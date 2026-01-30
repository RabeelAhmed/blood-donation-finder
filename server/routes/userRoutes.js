const express = require('express');
const router = express.Router();
const { getDonors, updateProfile, getAllUsers, addDonation, toggleFavorite } = require('../controllers/userController');
const { protect, admin, optionalProtect } = require('../middlewares/authMiddleware');

router.get('/donors', optionalProtect, getDonors);
router.post('/donation', protect, addDonation);
router.put('/profile', protect, updateProfile);
router.put('/favorite/:id', protect, toggleFavorite);
router.get('/', protect, admin, getAllUsers);

module.exports = router;
