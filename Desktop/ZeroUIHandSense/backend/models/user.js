// models/User.js
// MySQL Version - Student authentication and management
// Replaces the MongoDB User model

const bcrypt = require('bcryptjs');
const { query } = require('../config/mysql-db');

class User {
    // Create a new user (register)
    static async create(userData) {
        const { rollNumber, name, class: className, password } = userData;
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const sql = `
            INSERT INTO users (roll_number, name, class, password) 
            VALUES (?, ?, ?, ?)
        `;
        
        const result = await query(sql, [rollNumber, name, className, hashedPassword]);
        return { id: result.insertId, rollNumber, name, class: className };
    }

    // Find user by roll number (for login)
    static async findByRollNumber(rollNumber) {
        const sql = 'SELECT * FROM users WHERE roll_number = ?';
        const users = await query(sql, [rollNumber]);
        return users[0] || null;
    }

    // Find user by ID
    static async findById(id) {
        const sql = 'SELECT id, roll_number, name, class, created_at FROM users WHERE id = ?';
        const users = await query(sql, [id]);
        return users[0] || null;
    }

    // Verify password during login
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Get all users (admin function)
    static async getAll() {
        const sql = 'SELECT id, roll_number, name, class, created_at FROM users ORDER BY created_at DESC';
        return await query(sql);
    }

    // Get exam history for a user
    static async getExamHistory(userId) {
        const sql = `
            SELECT es.*, qp.title as paper_title 
            FROM exam_sessions es
            JOIN question_papers qp ON es.paper_id = qp.id
            WHERE es.user_id = ?
            ORDER BY es.start_time DESC
        `;
        return await query(sql, [userId]);
    }
}

module.exports = User;