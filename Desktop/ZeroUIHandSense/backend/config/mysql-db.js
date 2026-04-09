// config/mysql-db.js
// MySQL Database Connection with Connection Pooling
// This replaces the old MongoDB db.js file

const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables from root .env file
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Create connection pool (manages multiple database connections efficiently)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'handsense_exam',
    waitForConnections: true,
    connectionLimit: 10,        // Maximum concurrent connections
    queueLimit: 0,              // Unlimited queue (0 = no limit)
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Connected Successfully!');
        console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`📁 Database: ${process.env.DB_NAME || 'handsense_exam'}`);
        console.log(`👤 User: ${process.env.DB_USER || 'root'}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL Connection Failed!');
        console.error(`Error: ${error.message}`);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Is MySQL running? Check Services');
        console.log('   2. Check username/password in .env file');
        console.log('   3. Verify database exists: CREATE DATABASE handsense_exam');
        return false;
    }
}

// Helper function to execute queries with error handling
async function query(sql, params = []) {
    try {
        const [rows, fields] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error.message);
        console.error('SQL:', sql);
        throw error;
    }
}

// Get a single connection (for transactions)
async function getConnection() {
    return await pool.getConnection();
}

module.exports = {
    pool,
    testConnection,
    query,
    getConnection
};