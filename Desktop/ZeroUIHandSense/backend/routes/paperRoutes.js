// Question Paper Routes
const express = require('express');
const router = express.Router();
const { getAvailablePapers, getPaperById } = require('../controllers/paperController');
const authMiddleware = require('../middleware/authMiddleware');

// All paper routes require authentication
router.use(authMiddleware);

router.get('/available', getAvailablePapers);
router.get('/:paperId', getPaperById);

module.exports = router;