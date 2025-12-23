const cron = require("node-cron");
const rssService = require("../services/rss.service");

cron.schedule("*/10 * * * *", async () => {
    console.log("Running RSS News Fetch...");
    await rssService.fetchAllRSSNews();
});
