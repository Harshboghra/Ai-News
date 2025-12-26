require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

appapp.get("/health", (req, res) => {
  res.status(200).send("API is healthy");
});

// Routes
const newsRoutes = require("./routes/news.routes");
app.use("/api/news", newsRoutes);

// Start cron jobs
require("./utils/cron");

// Vercel serverless function export
module.exports = function handler(req, res) {
  return new Promise((resolve) => {
    req.url = req.url.replace(/^\/api/, '');
    app(req, res, () => {
      resolve();
    });
  });
}

// Local development server setup
if (require.main === module) {
  const http = require("http");
  const server = http.createServer(app);

  // Socket.IO setup for local development only
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

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(`Server running on ${PORT}`)
  );
}
