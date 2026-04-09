// routes/examRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAvailablePapers,
    startExam,
    getCurrentQuestion,
    saveAnswer,
    nextQuestion,
    submitExam,
    overExam,
    exitSystem
} = require('../controllers/examController');

// Authentication middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    next();
};

// Apply auth middleware to all exam routes
router.use(authMiddleware);

// Exam routes
router.get('/papers', getAvailablePapers);
router.post('/start', startExam);
router.get('/current-question', getCurrentQuestion);
router.post('/save-answer', saveAnswer);
router.post('/next', nextQuestion);
router.post('/submit', submitExam);
router.post('/over', overExam);
router.post('/exit', exitSystem);

module.exports = router;