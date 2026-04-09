// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, register, logout, getMe } = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/register', register);

// Private routes (require authentication)
router.post('/logout', logout);
router.get('/me', getMe);

module.exports = router;