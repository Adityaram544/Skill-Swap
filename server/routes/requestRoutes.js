const express = require('express');
const router = express.Router();
const { createRequest, getUserRequests, updateRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRequest);
router.get('/', protect, getUserRequests);
router.patch('/:id', protect, updateRequestStatus);

module.exports = router;
