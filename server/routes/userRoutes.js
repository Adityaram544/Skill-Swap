const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, uploadAvatar, getUserById, getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.post('/upload', protect, uploadAvatar);
router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
