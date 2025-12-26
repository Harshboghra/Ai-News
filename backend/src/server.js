require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
const newsRoutes = require("./routes/news.routes");
app.use("/api/news", newsRoutes);

// Start cron jobs
require("./utils/cron");

// Health check for Railway
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Railway deployment: Listen on PORT provided by Railway
const PORT = process.env.PORT || 5000;

// For Railway: Always start the server
const http = require("http");
const server = http.createServer(app);

// Socket.IO setup (works on Railway)
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Make io global
global.io = io;

io.on("connection", socket => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export app for Railway
module.exports = app;
