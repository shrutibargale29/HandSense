// test-db.js - Temporary test file
// Delete this after confirming connection works

const connectDB = require('./config/db');

async function test() {
    console.log('🧪 Testing Database Connection...\n');
    
    try {
        await connectDB();
        console.log('\n🎉 SUCCESS! Database connection is working perfectly.');
        console.log('You can now start building your exam system.\n');
        
        // Close connection after test
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('Connection closed.');
        
    } catch (error) {
        console.error('\n❌ Test failed. Please fix the issues above.');
    }
}

test();
