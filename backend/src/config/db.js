// src/config/db.js - UPDATED FOR MONGOOSE 7+
const mongoose = require('mongoose');

async function connectDatabase() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
        
        // Optional: Connection event listeners
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });
        
        // Handle process termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });
        
        return conn;
    } catch (error) {
        console.error(' Database connection failed:', error.message);
        
        // Fail fast in production
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        
        throw error;
    }
}

function disconnectDatabase() {
    return mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };