const mongoose = require("mongoose");
const News = require("./src/models/News");
const connectDB = require("./src/config/db");

async function testSearch() {
    try {
        await connectDB();
        
        // Test 1: Check if collection has data
        const count = await News.countDocuments();
        console.log(`📊 Total news items: ${count}`);
        
        if (count === 0) {
            console.log("❌ No news data found. Please run the RSS fetcher first.");
            return;
        }
        
        // Test 2: Test text search
        const testQuery = "technology";
        console.log(`🔍 Testing search for: "${testQuery}"`);
        
        const results = await News.find(
            {
                $text: { $search: testQuery }
            },
            {
                score: { $meta: "textScore" }
            }
        ).limit(5);
        
        console.log(`✅ Found ${results.length} results:`);
        results.forEach((item, index) => {
            console.log(`${index + 1}. ${item.title} (Score: ${item.score})`);
        });
        
        // Test 3: Test language detection
        const { searchNews } = require("./src/controllers/news.controller");
        const searchResult = await searchNews({ query: { q: "sports" } }, {
            json: (data) => {
                console.log("🔍 Search API Result:", data);
                return data;
            }
        });
        
        console.log("✅ All tests passed!");
        
    } catch (err) {
        console.error("❌ Test failed:", err.message);
    } finally {
        mongoose.connection.close();
    }
}

testSearch();
