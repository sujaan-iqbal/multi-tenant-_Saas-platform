// src/middleware/auth-fixed.js
const jwt = require('../utils/jwt');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
    console.log('🔐 Auth middleware running...');
    
    try {
        // Check authorization header
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader ? 'Present' : 'Missing');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No Bearer token');
            return res.status(401).json({ error: 'No token' });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token length:', token.length);
        
        // Verify token
        const decoded = jwt.verifyToken(token);
        console.log('Decoded:', decoded);
        
        // Find user
        const user = await User.findOne({
            _id: decoded.userId,
            tenantId: decoded.tenantId
        }).select('-passwordHash');
        
        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({ error: 'User not found' });
        }
        
        console.log('✅ User found:', user.email);
        req.user = user;
        req.tenantId = user.tenantId;
        
        next();
    } catch (error) {
        console.log('❌ Auth error:', error.message);
        return res.status(401).json({ error: 'Authentication failed: ' + error.message });
    }
};

module.exports = { authenticate };