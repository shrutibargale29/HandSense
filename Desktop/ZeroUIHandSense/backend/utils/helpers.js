// utils/helpers.js
// Common helper functions for the exam system

/**
 * Generate a random token
 * @param {number} length - Length of token
 * @returns {string} - Random token
 */
function generateRandomToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate roll number format
 * @param {string} rollNumber - Roll number to validate
 * @returns {boolean} - Is valid roll number
 */
function isValidRollNumber(rollNumber) {
    // Roll number should be alphanumeric, 4-20 characters
    const rollRegex = /^[A-Za-z0-9]{4,20}$/;
    return rollRegex.test(rollNumber);
}

/**
 * Sanitize input to prevent SQL injection
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
    if (!input) return '';
    return input
        .replace(/[<>]/g, '')  // Remove < and >
        .replace(/['"]/g, '')   // Remove quotes
        .trim();
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Calculate time remaining
 * @param {Date} startTime - Start time
 * @param {number} durationMinutes - Duration in minutes
 * @returns {object} - Time remaining object
 */
function calculateTimeRemaining(startTime, durationMinutes) {
    const now = new Date();
    const endTime = new Date(startTime.getTime() + (durationMinutes * 60 * 1000));
    const remaining = endTime - now;
    
    if (remaining <= 0) {
        return { expired: true, minutes: 0, seconds: 0, formatted: '00:00' };
    }
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return {
        expired: false,
        minutes,
        seconds,
        formatted: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
}

/**
 * Log API request details
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Next middleware
 */
function logRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
}

/**
 * Create API response wrapper
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {any} data - Response data
 * @returns {object} - Formatted response
 */
function createResponse(success, message, data = null) {
    const response = { success, message };
    if (data !== null) response.data = data;
    return response;
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null
 */
function extractToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise} - Result of function
 */
async function retry(fn, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            await sleep(Math.pow(2, i) * 1000);
        }
    }
    
    throw lastError;
}

module.exports = {
    generateRandomToken,
    isValidEmail,
    isValidRollNumber,
    sanitizeInput,
    formatDate,
    calculateTimeRemaining,
    logRequest,
    createResponse,
    extractToken,
    sleep,
    retry
};