require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// 🔴 SOCKET.IO SETUP
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

// Routes
const newsRoutes = require("./routes/news.routes");
app.use("/api/news", newsRoutes);

// Start cron jobs
require("./utils/cron");

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
    console.log(`Server running on ${PORT}`)
);
