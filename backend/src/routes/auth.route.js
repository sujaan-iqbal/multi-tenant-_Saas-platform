// src/routes/auth.route.js
const express = require('express');
const router = express.Router();
const authController= require('../controller/auth.controller');
const { authenticate }= require('../middleware/auth')

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/me', authenticate, authController.getCurrentUser);

router.post('/logout', authenticate, authController.logout)

module.exports = router;