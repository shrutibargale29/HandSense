// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const generateToken = (userId, rollNumber) => {
    return jwt.sign(
        { id: userId, rollNumber: rollNumber },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
};

// Login function
const login = async (req, res) => {
    try {
        const { rollNumber, password } = req.body;

        if (!rollNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Roll number and password are required'
            });
        }

        const user = await User.findByRollNumber(rollNumber);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid roll number or password'
            });
        }

        const isPasswordValid = await User.verifyPassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid roll number or password'
            });
        }

        const token = generateToken(user.id, user.roll_number);

        req.session.userId = user.id;
        req.session.rollNumber = user.roll_number;

        res.json({
            success: true,
            message: `Welcome ${user.name}!`,
            data: {
                token,
                user: {
                    id: user.id,
                    rollNumber: user.roll_number,
                    name: user.name,
                    class: user.class
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Register function
const register = async (req, res) => {
    try {
        const { rollNumber, name, class: className, password } = req.body;

        if (!rollNumber || !name || !className || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password.length < 4) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 4 characters'
            });
        }

        const existingUser = await User.findByRollNumber(rollNumber);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Roll number already registered'
            });
        }

        const newUser = await User.create({
            rollNumber,
            name,
            class: className,
            password
        });

        const token = generateToken(newUser.id, rollNumber);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                token,
                user: {
                    id: newUser.id,
                    rollNumber: newUser.rollNumber,
                    name: newUser.name,
                    class: newUser.class
                }
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// Logout function
const logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error during logout'
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
};

// Get Me function
const getMe = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                rollNumber: user.roll_number,
                name: user.name,
                class: user.class
            }
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = {
    login,
    register,
    logout,
    getMe
};