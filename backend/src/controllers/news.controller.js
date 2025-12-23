const News = require("../models/News");
const SearchTrend = require("../models/SearchTrend");
const detectLanguage = require("../utils/language");
const {
    getRecencyScore,
    getCategoryScore,
    getSourceScore,
    getExactMatchScore
} = require("../utils/ranking");
const trackSearch = require("../utils/trackSearch");

// 🔍 SEARCH NEWS
// exports.searchNews = async (req, res) => {
//     try {
//         const { q, language = "en", limit = 20 } = req.query;

//         if (!q) {
//             return res.status(400).json({ message: "Search query is required" });
//         }

//         const news = await News.find(
//             {
//                 $text: { $search: q },
//                 language
//             },
//             {
//                 score: { $meta: "textScore" }
//             }
//         )
//             .sort({
//                 score: { $meta: "textScore" },
//                 publishedAt: -1
//             })
//             .limit(Number(limit));

//         res.json({
//             count: news.length,
//             results: news
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Search failed", error });
//     }
// };

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

exports.searchNews = async (req, res) => {
    console.log('first')
    try {
        const { q, limit = 20 } = req.query;
        if (!q) return res.status(400).json({ message: "Query required" });

        const detectedLanguage = detectLanguage(q);

        // 1️⃣ Try detected language
        let results = await searchWithLanguage(q, detectedLanguage);

        console.log('results length: 1', results?.length);
        // 2️⃣ Fallback to English
        if (results.length === 0 && detectedLanguage !== "en") {
            results = await searchWithLanguage(q, "en");
            console.log('results length: 2', results?.length);
        }

        res.json({
            detectedLanguage,
            results: results.slice(0, Number(limit))
        });
    } catch (err) {
        console.log("Search error:", err.message);
        res.status(500).json({ message: "Search failed" });
    }
};

exports.suggestNews = async (req, res) => {
    try {
        const { q, language = "en", limit = 8 } = req.query;

        if (!q) return res.status(400).json({ message: "Query required" });

        trackSearch(q);

        const regex = new RegExp("^" + q, "i");

        const suggestions = await News.find(
            {
                language,
                $or: [
                    { title: regex },
                    { tags: regex }
                ]
            },
            {
                title: 1,
                source: 1,
                publishedAt: 1
            }
        )
            .sort({ publishedAt: -1 })
            .limit(Number(limit));

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: "Suggestion failed" });
    }
};

exports.getTrending = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const trends = await SearchTrend.find()
            .sort({ count: -1, lastSearchedAt: -1 })
            .limit(Number(limit))
            .select("query count");

        res.json(trends);
    } catch {
        res.status(500).json({ message: "Trending fetch failed" });
    }
};

async function searchWithLanguage(query, language) {
    try {
        const regex = new RegExp("^" + query, "i");
        const raw = await News.find(
            {
                language,
                $or: [
                    { title: regex },
                    { tags: regex }
                ]
            },
            {
                title: 1,
                source: 1,
                publishedAt: 1
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
