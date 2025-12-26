require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

console.log("🚀 Starting AI News Backend...");

// Initialize Express app
const app = express();

// CORS configuration for Railway
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://resourceful-wonder-production-e8da.up.railway.app'] // Replace with your actual frontend domain
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow local development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced health check for Railway
app.get("/health", (req, res) => {
  const healthData = {
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  };

  // Check database connection status
  const mongoose = require('mongoose');
  healthData.database = {
    connected: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState,
    name: mongoose.connection.name
  };

  res.status(200).json(healthData);
});

// Routes
console.log("📡 Setting up API routes...");
const newsRoutes = require("./routes/news.routes");
app.use("/api/news", newsRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Database connection with retry logic
async function initializeDatabase() {
  try {
    console.log("📊 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);

    // In Railway production, don't exit - let Railway handle restarts
    if (process.env.NODE_ENV === 'production') {
      console.log("🔄 Continuing without database for Railway health checks...");
      return false;
    }

    // In development, exit on database failure
    process.exit(1);
  }
}

// Railway deployment: Get port from environment
const PORT = parseInt(process.env.PORT) || 5000;
console.log(`🔌 Starting server on port ${PORT}...`);

// Initialize database connection
initializeDatabase().then((dbConnected) => {
  // Start cron jobs (only if DB is connected in production)
  if (dbConnected || process.env.NODE_ENV !== 'production') {
    try {
      require("./utils/cron");
      console.log("⏰ Cron jobs initialized");
    } catch (error) {
      console.warn("⚠️  Cron jobs failed to initialize:", error.message);
    }
  }

  // Create HTTP server
  const http = require("http");
  const server = http.createServer(app);

  // Socket.IO setup with Railway-compatible configuration
  try {
    const { Server } = require("socket.io");
    const io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? ['https://your-frontend-domain.com'] // Replace with actual domain
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Make io global
    global.io = io;

    io.on("connection", (socket) => {
      console.log(`🔗 Client connected: ${socket.id}`);

      socket.on("disconnect", (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);
      });

      // Handle connection errors
      socket.on("connect_error", (error) => {
        console.error(`Connection error for ${socket.id}:`, error);
      });
    });

    console.log("📡 Socket.IO initialized");
  } catch (error) {
    console.warn("⚠️  Socket.IO initialization failed:", error.message);
  }

  // Start server with error handling
  server.listen(PORT, '0.0.0.0', (error) => {
    if (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    }

    console.log(`✅ Server successfully started on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);

    if (process.env.NODE_ENV === 'production') {
      console.log(`🚂 Railway deployment ready!`);
    } else {
      console.log(`🏠 Local development server ready!`);
    }
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error("❌ Server error:", error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

}).catch((error) => {
  console.error("❌ Failed to initialize application:", error);
  process.exit(1);
});

// Export app for Railway/testing
module.exports = app;
