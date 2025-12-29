/**
 * AI Processing Service
 * Handles AI content generation using Groq SDK
 */

const BaseService = require("./base.service");
const News = require("../models/News");
const groqService = require("./groqService");

class AIProcessingService extends BaseService {
  constructor() {
    super(News);
    this.processingQueue = [];
    this.isProcessing = false;
  }

  /**
   * Process pending AI content generation using Groq
   */
  async processPendingAIContent(limit = 10) {
    if (this.isProcessing) {
      this.logger.info("AI processing already in progress");
      return;
    }

    this.isProcessing = true;
    this.logger.info(`Starting Groq AI processing for up to ${limit} items`);

    try {
      const pendingNews = await News.getPendingAiProcessing(limit);
      this.logger.info(`Found ${pendingNews.length} items for AI processing`);

      for (const news of pendingNews) {
        await this.processSingleNews(news);
      }

      this.logger.info("Groq AI processing completed");
    } catch (error) {
      this.logger.error("Groq AI processing failed:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single news item with Groq AI
   */
  async processSingleNews(news) {
    try {
      // Update status to processing
      await News.findByIdAndUpdate(news._id, { 
        aiStatus: 'processing',
        updatedAt: new Date()
      });

      // Use Groq service to process the news
      await groqService.processSingleNews(news);
      this.logger.info(`Groq AI processing completed for: ${news.title}`);

    } catch (error) {
      this.logger.error(`Groq AI processing failed for ${news.title}:`, error);
      await News.findByIdAndUpdate(news._id, { 
        aiStatus: 'failed',
        updatedAt: new Date()
      });
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats() {
    return await groqService.getProcessingStats();
  }

  /**
   * Retry failed AI processing
   */
  async retryFailedProcessing() {
    return await groqService.retryFailedProcessing();
  }
}

// Export singleton instance
const aiProcessingService = new AIProcessingService();
module.exports = aiProcessingService;
