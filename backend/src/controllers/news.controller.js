const News = require("../models/News");
const detectLanguage = require("../utils/language");
const {
    getRecencyScore,
    getCategoryScore,
    getSourceScore,
    getExactMatchScore
} = require("../utils/ranking");

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
    try {
        const { q, limit = 20 } = req.query;
        if (!q) return res.status(400).json({ message: "Query required" });

        const detectedLanguage = detectLanguage(q);

        // 1️⃣ Try detected language
        let results = await searchWithLanguage(q, detectedLanguage);

        // 2️⃣ Fallback to English
        if (results.length === 0 && detectedLanguage !== "en") {
            results = await searchWithLanguage(q, "en");
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

async function searchWithLanguage(query, language) {
    try {
        const raw = await News.find(
            {
                $text: { $search: query },
                language
            },
            {
                score: { $meta: "textScore" }
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
