require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const app = express();

/* -------------------- MIDDLEWARE FIRST -------------------- */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔥 REQUIRED for Railway OPTIONS preflight
app.options("*", cors());

app.use(express.json());

/* -------------------- ROUTES -------------------- */
const newsRoutes = require("./routes/news.routes");
app.use("/api/news", newsRoutes);

// Health check (Railway uses this)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", time: new Date().toISOString() });
});

// Root test
app.get("/", (req, res) => {
  res.send("AI News Backend running on Railway 🚄");
});

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

/* -------------------- SOCKET.IO -------------------- */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

global.io = io;

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

/* -------------------- START SERVER FIRST -------------------- */
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

/* -------------------- CONNECT DB AFTER SERVER START -------------------- */
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

/* -------------------- START CRON AFTER DB -------------------- */
require("./utils/cron");

/* -------------------- EXPORT APP -------------------- */
module.exports = app;
