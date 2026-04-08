// config/db.js - Database connection configuration
const mongoose = require('mongoose');
const path = require('path');

// Load .env from parent folder
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }
        
        console.log('🔄 Connecting to MongoDB...');
        
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`✅ MongoDB Connected Successfully!`);
        console.log(`📍 Host: ${conn.connection.host}`);
        console.log(`📁 Database: ${conn.connection.name}`);
        
        return conn;
        
    } catch (error) {
        console.error(`❌ MongoDB Connection Failed!`);
        console.error(`Error: ${error.message}`);
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Is MongoDB running? Run "mongod" in terminal');
        console.log('   2. If using Atlas, check your internet connection');
        console.log('   3. Verify MONGODB_URI in .env file is correct');
        
        process.exit(1);
    }
};

module.exports = connectDB;