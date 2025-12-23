const News = require("../models/News");
const detectLanguage = require("../utils/language");
const {
    getRecencyScore,
    getCategoryScore,
    getSourceScore,
    getExactMatchScore
} = require("../utils/ranking");
const trackSearch = require("../utils/trackSearch");
const searchService = require("../services/search.service");

// 🕒 LATEST NEWS
exports.getLatestNews = async (req, res) => {
    try {
        const { language = "en", limit = 20 } = req.query;

        const news = await News.find({ language })
            .sort({ publishedAt: -1 })
            .limit(Number(limit));

        res.json({
            count: news.length,
            results: news
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch latest news" });
    }
};

// Enhanced search with service layer
exports.searchNews = async (req, res) => {
    try {
        const { q: query, limit = 20, language = 'en' } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
                errors: ["Query parameter 'q' is required"]
            });
        }

        const result = await searchService.searchNews(query, {
            limit: parseInt(limit),
            language
        });

        res.json({
            success: true,
            data: result,
            message: "Search completed successfully"
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
            success: false,
            message: "Search failed",
            errors: [error.message]
        });
    }
};

// Enhanced suggestions with service layer
exports.suggestNews = async (req, res) => {
    try {
        const { q: query, limit = 8, language = 'en' } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Query must be at least 2 characters long",
                errors: ["Invalid query parameter"]
            });
        }

        const suggestions = await searchService.getSuggestions(query, {
            limit: parseInt(limit),
            language
        });

        res.json({
            success: true,
            data: suggestions,
            message: "Suggestions retrieved successfully"
        });
    } catch (error) {
        console.error("Get suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get suggestions",
            errors: [error.message]
        });
    }
};

// Category-based endpoints
exports.getByCategory = async (req, res) => {
    try {
        const { category, limit = 20, language = 'en', page = 1 } = req.query;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required",
                errors: ["Category parameter is required"]
            });
        }

        const result = await searchService.getByCategory(category, {
            limit: parseInt(limit),
            language,
            page: parseInt(page)
        });

        res.json({
            success: true,
            data: result,
            message: "Category news retrieved successfully"
        });
    } catch (error) {
        console.error("Get by category error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get category news",
            errors: [error.message]
        });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const { language = 'en' } = req.query;

        const categories = await searchService.getCategories({ language });

        res.json({
            success: true,
            data: categories,
            message: "Categories retrieved successfully"
        });
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get categories",
            errors: [error.message]
        });
    }
};

exports.getCategoryStats = async (req, res) => {
    try {
        const { category, language = 'en' } = req.query;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required",
                errors: ["Category parameter is required"]
            });
        }

        const stats = await searchService.getCategoryStats(category, { language });

        res.json({
            success: true,
            data: stats,
            message: "Category statistics retrieved successfully"
        });
    } catch (error) {
        console.error("Get category stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get category statistics",
            errors: [error.message]
        });
    }
};

exports.getTrending = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const trends = await searchService.getTrending({ limit: parseInt(limit) });

        res.json({
            success: true,
            data: trends,
            message: "Trending searches retrieved successfully"
        });
    } catch (error) {
        console.error("Get trending error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get trending searches",
            errors: [error.message]
        });
    }
};

exports.getSearchStats = async (req, res) => {
    try {
        const stats = await searchService.getSearchStats();

        res.json({
            success: true,
            data: stats,
            message: "Search statistics retrieved successfully"
        });
    } catch (error) {
        console.error("Get search stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get search statistics",
            errors: [error.message]
        });
    }
};


async function searchWithLanguage(query, language) {
    try {
        // Use full-text search instead of prefix matching
        const regex = new RegExp(query, "i");
        const raw = await News.find(
            {
                language,
                $or: [
                    { title: regex },
                    { tags: regex },
                    { description: regex }
                ]
            },
            {
                title: 1,
                source: 1,
                publishedAt: 1,
                description: 1
            }
        ).limit(50);

        return raw
            .map(item => {
                const finalScore =
                    (item.score || 0) * 5 +
                    getRecencyScore(item.publishedAt) +
                    getCategoryScore(query, item.category) +
                    getSourceScore(item.source) +
                    getExactMatchScore(query, item.title);

                return {
                    ...item.toObject(),
                    finalScore
                };
            })
            .sort((a, b) => b.finalScore - a.finalScore);
    } catch (err) {
        console.error("Search error:", err.message);
        return [];
    }
}
