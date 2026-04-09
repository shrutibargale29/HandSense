// server.js
// Main entry point for HandSense Exam System

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import database connection
const { testConnection } = require('./config/mysql-db');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// For any route not starting with /api, serve index.html
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Security headers
app.use(helmet());

// CORS (allow frontend to communicate)
// CORS (allow frontend to communicate) - FIXED
app.use(cors({
    origin: '*',  // Allow all origins for testing
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (prevent abuse)
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'handsense_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_TIMEOUT) || 3600000
    }
}));

// ============================================
// ROUTES (to be added)
// Add this after the session middleware and before the health check

// ============================================
// IMPORT ROUTES
// ============================================
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');

// ============================================
// REGISTER ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/exam', examRoutes);
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'HandSense Exam System is running',
        timestamp: new Date().toISOString()
    });
});

// Test database endpoint
app.get('/api/test-db', async (req, res) => {
    const connected = await testConnection();
    if (connected) {
        res.json({ success: true, message: 'Database connected successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Database connection failed' });
    }
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     🎙️  HANDSENSE - Voice Exam System                    ║
║                                                          ║
║     Server running on port: ${PORT}                           ║
║     Environment: ${process.env.NODE_ENV || 'development'}                    ║
║                                                          ║
║     📍 API URL: http://localhost:${PORT}                   ║
║     🩺 Health: http://localhost:${PORT}/api/health        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
    
    // Test database connection
    await testConnection();
});