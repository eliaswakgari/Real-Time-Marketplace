const express = require('express');
const { 
  signup, 
  login, 
  logout, 
  refreshToken, 
  getCurrentUser 
} = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;