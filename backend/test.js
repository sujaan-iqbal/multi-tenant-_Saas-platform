// // test-simple.js
// require('dotenv').config();
// const mongoose = require('mongoose');

// console.log('Testing Mongoose 7+ connection...');

// // Simplest possible connection
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log('Connected!');
//         console.log('Database:', mongoose.connection.db.databaseName);
//         mongoose.disconnect();
//         process.exit(0);
//     })
//     .catch(err => {
//         console.log('Error:', err.message);
//         process.exit(1);
//     });

// const jwt= require('./src/utils/jwt')
// const brcrypt= require('./src/utils/bcrypt')
// console.log("testing utilities...")

// middleware testing

// test-middleware.js
// Test the authentication flow
require('dotenv').config();
const jwt = require('./src/utils/jwt');

// Mock a user ID and tenant ID from your seed data
const testUserId = "6981f2d7fde114ebe7330ef8"; // Use a real user ID from your seed
const testTenantId = "6981f2d7fde114ebe7330ef8"; // Use Acme tenant ID

console.log('Testing JWT generation and verification...\n');

try {
    // 1. Generate a test token
    const token = jwt.generateToken({
        userId: testUserId,
        tenantId: testTenantId,
        role: 'owner'
    });
    
    console.log('✅ Generated token:', token.substring(0, 50) + '...');
    
    // 2. Verify the token
    const decoded = jwt.verifyToken(token);
    console.log('✅ Token verified successfully');
    console.log('Decoded payload:', decoded);
    
    // 3. Test expiration (optional)
    const expiredToken = jwt.generateToken(
        { userId: testUserId, tenantId: testTenantId },
        '1ms' // 1 millisecond expiration
    );
    
    setTimeout(() => {
        try {
            jwt.verifyToken(expiredToken);
            console.log('❌ Token should have expired but didn\'t');
        } catch (err) {
            console.log('✅ Expired token correctly rejected:', err.message);
        }
    }, 10);
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
}