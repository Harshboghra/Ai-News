const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-news-test';

        // For CI/CD environments, skip MongoDB connection if no URI is provided
        if (!process.env.MONGO_URI && !process.env.MONGODB_URI && process.env.NODE_ENV === 'test') {
            console.log("Skipping MongoDB connection in test environment");
            return;
        }

        if (!mongoUri) {
            throw new Error("MONGO_URI environment variable is required");
        }

        await mongoose.connect(mongoUri);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);

        // In CI/CD or test environments, don't exit the process
        // Just log the error and continue (for health checks)
        if (process.env.NODE_ENV === 'test' || process.env.CI) {
            console.log("Continuing without MongoDB connection for CI/CD testing");
            return;
        }

        // Only exit in production/development if MongoDB is required
        process.exit(1);
    }
};

module.exports = connectDB;
