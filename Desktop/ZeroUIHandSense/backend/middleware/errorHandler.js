// Global Error Handler Middleware

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: Object.values(err.errors).map(e => e.message).join(', ')
        });
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry found'
        });
    }
    
    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    
    // Default error
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
};

module.exports = errorHandler;