const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Signup / Login for Auth pages
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;
