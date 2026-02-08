const app = require('./app');
const { connectDatabase } = require('./config/db');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB first, then start the HTTP server.
connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to start server due to database connection error:', err.message);
        process.exit(1);
    });