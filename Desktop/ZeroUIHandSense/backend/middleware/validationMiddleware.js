// Input Validation Middleware
const { body, validationResult } = require('express-validator');

// Login validation rules
const validateLogin = [
    body('rollNumber').notEmpty().withMessage('Roll number is required'),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// Answer validation rules
const validateAnswer = [
    body('answer').notEmpty().withMessage('Answer cannot be empty'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// Paper selection validation
const validatePaperSelection = [
    body('paperId').notEmpty().withMessage('Paper ID is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    validateLogin,
    validateAnswer,
    validatePaperSelection
};