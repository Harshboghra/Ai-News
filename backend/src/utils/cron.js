const cron = require("node-cron");
const rssService = require("../services/rss.service");
const aiProcessingService = require("../services/aiProcessing.service");

const isProd = process.env.NODE_ENV === "production";
const timezone = process.env.CRON_TZ || "UTC";
const disabled = String(process.env.DISABLE_CRON || "").toLowerCase() === "true";

if (!disabled && process.env.NODE_ENV !== "test") {
  const rssExpr = isProd ? "*/30 * * * *" : "*/5 * * * *";
  const aiProcessExpr = isProd ? "*/10 * * * *" : "*/2 * * * *";
  const aiRetryExpr = isProd ? "0 * * * *" : "*/5 * * * *";
  const aiProcessLimit = isProd ? 50 : 20;

  cron.schedule(rssExpr, async () => {
    await rssService.fetchAllRSSNews();
  }, { timezone });

  cron.schedule(aiProcessExpr, async () => {
    await aiProcessingService.processPendingAIContent(aiProcessLimit);
  }, { timezone });

  cron.schedule(aiRetryExpr, async () => {
    await aiProcessingService.retryFailedProcessing();
  }, { timezone });
}
