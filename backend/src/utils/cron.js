const cron = require("node-cron");
const fetchRSSNews = require("../services/rss.service");

cron.schedule("*/1 * * * *", async () => {
    console.log("Running RSS News Fetch...");
    await fetchRSSNews();
});
