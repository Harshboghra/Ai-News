const express = require("express");
const router = express.Router();
const {
    searchNews,
    getLatestNews,
    getAllLatestNews,
    suggestNews,
    getByCategory,
    getCategories,
    getCategoryStats,
    getSearchStats,
    getAIProcessingStats,
    processPendingAIContent,
    retryFailedAIProcessing
} = require("../controllers/news.controller");

// Search news
router.get("/search", searchNews);

// Get latest news
router.get("/latest", getLatestNews);

// Get suggestions
router.get("/suggest", suggestNews);

// Category-based endpoints
router.get("/category", getByCategory);
router.get("/categories", getCategories);
router.get("/category/stats", getCategoryStats);

// Statistics endpoints
router.get("/stats", getSearchStats);

// AI Processing Management Routes
router.get("/ai/stats", getAIProcessingStats);
router.post("/ai/process", processPendingAIContent);
router.post("/ai/retry", retryFailedAIProcessing);

// Admin routes (for backend management)
router.get("/admin/latest", getAllLatestNews);

module.exports = router;
