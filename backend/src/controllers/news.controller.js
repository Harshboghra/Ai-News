const News = require("../models/News");
const searchService = require("../services/search.service");
const aiProcessingService = require("../services/aiProcessing.service");

// 🕒 LATEST NEWS WITH PAGINATION (AI-PROCESSED ONLY)
exports.getLatestNews = async (req, res) => {
    // fetching latest AI-processed news
    try {
        const { language = "en", limit = 20, page = 1 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination (AI-processed only)
        const totalCount = await News.countDocuments({ 
            language,
            aiStatus: 'completed',
            aiContent: { $exists: true, $ne: null }
        });

        // Get paginated results (AI-processed only)
        const news = await News.find({ 
            language,
            aiStatus: 'completed',
            aiContent: { $exists: true, $ne: null }
        })
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNext = pageNum < totalPages;
        const hasPrev = pageNum > 1;

        res.json({
            success: true,
            data: {
                news,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    hasNext,
                    hasPrev,
                    limit: limitNum
                }
            },
            message: "Latest AI-processed news retrieved successfully"
        });
    } catch (error) {
        // error already handled by response
        res.status(500).json({
            success: false,
            message: "Failed to fetch latest news",
            errors: [error.message]
        });
    }
};

// 🕒 ALL LATEST NEWS (FOR ADMIN/BACKEND USE)
exports.getAllLatestNews = async (req, res) => {
    // fetching latest news (including unprocessed)
    try {
        const { language = "en", limit = 20, page = 1 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination
        const totalCount = await News.countDocuments({ language });

        // Get paginated results
        const news = await News.find({ language })
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNext = pageNum < totalPages;
        const hasPrev = pageNum > 1;

        res.json({
            success: true,
            data: {
                news,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    hasNext,
                    hasPrev,
                    limit: limitNum
                }
            },
            message: "All latest news retrieved successfully"
        });
    } catch (error) {
        // error already handled by response
        res.status(500).json({
            success: false,
            message: "Failed to fetch all latest news",
            errors: [error.message]
        });
    }
};

// 🤖 AI PROCESSING MANAGEMENT
exports.getAIProcessingStats = async (req, res) => {
    try {
        const stats = await aiProcessingService.getProcessingStats();
        
        res.json({
            success: true,
            data: stats,
            message: "AI processing statistics retrieved successfully"
        });
    } catch (error) {
        // error already handled by response
        res.status(500).json({
            success: false,
            message: "Failed to get AI processing statistics",
            errors: [error.message]
        });
    }
};

exports.processPendingAIContent = async (req, res) => {
    try {
        const { limit = 10 } = req.body;
        
        await aiProcessingService.processPendingAIContent(limit);
        
        res.json({
            success: true,
            message: `Started AI processing for up to ${limit} pending items`
        });
    } catch (error) {
        // error already handled by response
        res.status(500).json({
            success: false,
            message: "Failed to start AI processing",
            errors: [error.message]
        });
    }
};

exports.retryFailedAIProcessing = async (req, res) => {
    try {
        await aiProcessingService.retryFailedProcessing();
        
        res.json({
            success: true,
            message: "Retried failed AI processing"
        });
    } catch (error) {
        // error already handled by response
        res.status(500).json({
            success: false,
            message: "Failed to retry failed AI processing",
            errors: [error.message]
        });
    }
};

// Enhanced search with pagination support
exports.searchNews = async (req, res) => {
    try {
        const { q: query, limit = 20, language = 'en', page = 1 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
                errors: ["Query parameter 'q' is required"]
            });
        }

        // Perform search with pagination
        const result = await searchService.searchNews(query, {
            limit: limitNum,
            language,
            page: pageNum
        });

        // Calculate pagination metadata for search results
        // Note: Since search results are ranked and limited, we can't get accurate total count
        // We'll use the result length to determine if there are more results
        const hasMore = result.results && result.results.length === limitNum;

        res.json({
            success: true,
            data: {
                news: result.results || [],
                pagination: {
                    currentPage: pageNum,
                    hasNext: hasMore,
                    hasPrev: pageNum > 1,
                    limit: limitNum
                }
            },
            message: "Search completed successfully"
        });
    } catch (error) {
        // error already handled by response
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
        // error already handled by response
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
        // error already handled by response
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
        // error already handled by response
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
        // error already handled by response
        res.status(500).json({
            success: false,
            message: "Failed to get category statistics",
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
        // error already handled by response
        res.status(500).json({
            success: false,
            message: "Failed to get search statistics",
            errors: [error.message]
        });
    }
};


