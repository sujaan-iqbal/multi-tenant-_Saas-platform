// test-simple.js
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing Mongoose 7+ connection...');

// Simplest possible connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected!');
        console.log('Database:', mongoose.connection.db.databaseName);
        mongoose.disconnect();
        process.exit(0);
    })
    .catch(err => {
        console.log('❌ Error:', err.message);
        process.exit(1);
    });