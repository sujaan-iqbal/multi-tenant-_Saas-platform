// src/middleware/rateLimitAI.js
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute per user (Gemini allows 60)
    message: { error: 'Too many AI requests. Please wait a minute.' },
    keyGenerator: (req) => req.user._id.toString() // Limit per user
});

// Use in routes:
router.post('/:id/analyze', aiLimiter, documentController.analyzeDocument);