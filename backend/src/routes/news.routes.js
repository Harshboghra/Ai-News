const express = require("express");
const router = express.Router();
const {
    searchNews,
    getLatestNews,
    suggestNews,
    getByCategory,
    getCategories,
    getCategoryStats,
    getSearchStats
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

module.exports = router;
