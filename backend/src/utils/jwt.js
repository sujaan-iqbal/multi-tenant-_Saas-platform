// src/utils/jwt.js - ROBUST VERSION
const jwt = require('jsonwebtoken');

// Helper to get JWT_SECRET with fallback
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('❌ JWT_SECRET is not set in environment variables');
        console.error('Add to .env: JWT_SECRET=your-secret-key-here');
        throw new Error('JWT_SECRET is not configured');
    }
    return secret;
};

const generateToken = (payload, expiresIn = '24h') => {
    try {
        const secret = getJwtSecret();
        return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
        console.error('Token generation failed:', error.message);
        throw error;
    }
};

const verifyToken = (token) => {
    try {
        const secret = getJwtSecret();
        return jwt.verify(token, secret);
    } catch (error) {
        console.error('Token verification failed:', error.message);
        throw error;
    }
};

const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken
};