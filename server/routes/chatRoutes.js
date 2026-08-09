const express = require('express');
const router = express.Router();
const {
  getMessagesWithUser,
  getRecentConversations,
  deleteMessage,
  deleteContact
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations/list', protect, getRecentConversations);
router.get('/:userId', protect, getMessagesWithUser);
router.delete('/message/:messageId', protect, deleteMessage);
router.delete('/contact/:contactId', protect, deleteContact);

module.exports = router;
