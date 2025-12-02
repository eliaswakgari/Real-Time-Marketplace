const express = require('express');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
} = require('../controllers/messageController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/conversations', authenticateToken, getConversations);
router.get('/:userId', authenticateToken, getMessages);
router.post('/', authenticateToken, sendMessage);
router.patch('/read', authenticateToken, markAsRead);

module.exports = router;