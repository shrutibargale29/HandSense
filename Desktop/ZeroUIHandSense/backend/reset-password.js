const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function resetPassword() {
    const password = 'student123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Password:', password);
    console.log('Hash:', hashedPassword);
    
    // Connect to MySQL
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'handsense_exam'
    });
    
    // Update or insert user
    await connection.execute(
        'DELETE FROM users WHERE roll_number = ?',
        ['2024001']
    );
    
    await connection.execute(
        'INSERT INTO users (roll_number, name, class, password) VALUES (?, ?, ?, ?)',
        ['2024001', 'Test Student', '12th Grade', hashedPassword]
    );
    
    console.log('✅ User updated with correct password hash!');
    
    // Verify
    const [rows] = await connection.execute('SELECT * FROM users WHERE roll_number = ?', ['2024001']);
    console.log('User:', rows[0]);
    
    await connection.end();
}

resetPassword();