const Parser = require("rss-parser");
const parser = new Parser();
const News = require("../models/News");
const rssSources = require("../utils/rssSources");

async function fetchRSSNews() {
    for (const feed of rssSources) {
        try {
            const data = await parser.parseURL(feed.url);

            for (const item of data.items) {
                if (!item.link) continue;

                const result = await News.updateOne(
                    { sourceUrl: item.link },
                    {
                        $setOnInsert: {
                            title: item.title,
                            description: item.contentSnippet || "",
                            content: item.content || "",
                            language: feed.language,
                            category: feed.category,
                            source: feed.source,
                            sourceUrl: item.link,
                            publishedAt: item.pubDate
                                ? new Date(item.pubDate)
                                : new Date()
                        }
                    },
                    { upsert: true }
                );

                // 🔴 Emit only if new document inserted
                if (result.upsertedCount > 0) {
                    const newNews = await News.findOne({
                        sourceUrl: item.link
                    });

                    global.io.emit("news:new", newNews);
                }
            }
        } catch (err) {
            console.error("RSS error:", err.message);
        }
    }
}

module.exports = fetchRSSNews;
