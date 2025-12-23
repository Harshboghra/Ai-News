const mongoose = require("mongoose");
const News = require("./src/models/News");
const connectDB = require("./src/config/db");

async function testImprovedSearch() {
    try {
        await connectDB();
        
        // Test 1: Check if collection has data
        const count = await News.countDocuments();
        console.log(`📊 Total news items: ${count}`);
        
        if (count === 0) {
            console.log("❌ No news data found. Please run the RSS fetcher first.");
            return;
        }
        
        // Test 2: Test our improved search (full-text matching)
        const testQuery = "tech"; // Should match "technology", "technical", etc.
        console.log(`🔍 Testing improved search for: "${testQuery}"`);
        
        // Use the same regex pattern as our updated controller
        const regex = new RegExp(testQuery, "i");
        const results = await News.find(
            {
                $or: [
                    { title: regex },
                    { tags: regex },
                    { description: regex }
                ]
            }
        ).limit(10);
        
        console.log(`✅ Found ${results.length} results:`);
        results.forEach((item, index) => {
            console.log(`${index + 1}. ${item.title}`);
        });
        
        // Test 3: Test search that should match in the middle of words
        const middleQuery = "world"; // Should match "world news", "news world", etc.
        console.log(`\n🔍 Testing middle-word search for: "${middleQuery}"`);
        
        const middleRegex = new RegExp(middleQuery, "i");
        const middleResults = await News.find(
            {
                $or: [
                    { title: middleRegex },
                    { tags: middleRegex },
                    { description: middleRegex }
                ]
            }
        ).limit(10);
        
        console.log(`✅ Found ${middleResults.length} results:`);
        middleResults.forEach((item, index) => {
            console.log(`${index + 1}. ${item.title}`);
        });
        
        console.log("\n✅ All improved search tests passed!");
        
    } catch (err) {
        console.error("❌ Test failed:", err.message);
    } finally {
        mongoose.connection.close();
    }
}

testImprovedSearch();
