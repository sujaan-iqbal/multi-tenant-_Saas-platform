// src/app.js
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

app.use(express.json());
require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ LOADED' : '❌ MISSING');
// Debug middleware
app.use((req, res, next) => {
    console.log(` ${req.method} ${req.url}`);
    next();
});


app.use('/health', require('./routes/health.route'));
app.use('/api/auth', require('./routes/auth.route'));
// In src/app.js, add after auth routes:
app.use('/api/documents', require('./routes/document.route'));

app.get('/', (req, res) => {
    res.json({ message: 'server is working' });
});

module.exports = app;