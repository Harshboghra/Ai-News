require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect DB (safe for Vercel)
let isConnected = false;
async function initDB() {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
}
initDB();

app.use(cors());
app.use(express.json());

// Routes
const newsRoutes = require("./routes/news.routes");
app.use("/api/news", newsRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("AI News Backend running 🚀");
});

// ✅ EXPORT EXPRESS APP (THIS IS KEY)
module.exports = app;
