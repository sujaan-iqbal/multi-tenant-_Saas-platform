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
// test-jwt-fixed.js
// test-all.js
// test-route-setup.js




// const express = require('express');
// const app = express();

// // Test if middleware works
// const testAuth = (req, res, next) => {
//     console.log('Test middleware called');
//     req.user = { id: 'test-user', tenantId: 'test-tenant' };
//     next();
// };

// // Test route
// app.get('/api/auth/test-me', testAuth, (req, res) => {
//     res.json({ 
//         message: 'Test route works',
//         user: req.user 
//     });
// });

// app.listen(3001, () => {
//     console.log('Test server on http://localhost:3001');
//     console.log('Test: curl http://localhost:3001/api/auth/test-me');
// });



// get-token-simple.js - No dependencies
const https = require('https');

const data = JSON.stringify({
    companyName: 'Simple Test',
    email: `simple${Date.now()}@test.com`,
    password: 'Simple123!'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(responseData);
            console.log('\n=== FULL RESPONSE ===');
            console.log(JSON.stringify(result, null, 2));
            
            if (result.token) {
                console.log('\n=== TOKEN (FULL) ===');
                console.log(result.token);
                console.log('\nToken length:', result.token.length);
            }
        } catch (e) {
            console.log('Raw response:', responseData);
        }
    });
});

req.on('error', (error) => {
    console.error('Request failed:', error.message);
});

req.write(data);
req.end();