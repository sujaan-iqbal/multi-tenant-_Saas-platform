// src/app.js
const express = require('express');
const app = express();

app.use(express.json());
require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ LOADED' : '❌ MISSING');

app.use('/health', require('./routes/health.route'));
app.use('/api/auth', require('./routes/auth.route'));

app.get('/', (req, res) => {
    res.json({ message: 'server is working' });
});

module.exports = app;