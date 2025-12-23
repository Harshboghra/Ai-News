const SearchTrend = require("../models/SearchTrend");

async function trackSearch(query) {
    if (!query) return;

    await SearchTrend.findOneAndUpdate(
        { query: query.toLowerCase() },
        {
            $inc: { count: 1 },
            $set: { lastSearchedAt: new Date() }
        },
        { upsert: true }
    );
}

module.exports = trackSearch;
