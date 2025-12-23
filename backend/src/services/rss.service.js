/**
 * RSS Service
 * Enhanced RSS feed processing with better abstraction and error handling
 */

const Parser = require("rss-parser");
const BaseService = require("./base.service");
const News = require("../models/News");
const rssSources = require("../utils/rssSources");
const SearchTrend = require("../models/SearchTrend");

class RSSService extends BaseService {
  constructor() {
    super(News);
    this.parser = new Parser();
    this.sources = rssSources;
    this.processingStats = {
      totalProcessed: 0,
      totalInserted: 0,
      totalUpdated: 0,
      errors: []
    };
  }

  /**
   * Fetch and process all RSS feeds
   * @returns {Promise<Object>} - Processing statistics
   */
  async fetchAllRSSNews() {
    this.logger.info('Starting RSS feed processing', { sourceCount: this.sources.length });
    
    // Reset stats
    this.processingStats = {
      totalProcessed: 0,
      totalInserted: 0,
      totalUpdated: 0,
      errors: []
    };

    for (const feed of this.sources) {
      try {
        await this.processFeed(feed);
      } catch (error) {
        this.logger.error(`Failed to process feed: ${feed.url}`, error);
        this.processingStats.errors.push({
          feed: feed.url,
          error: error.message
        });
      }
    }

    this.logger.info('RSS feed processing completed', this.processingStats);
    return this.processingStats;
  }

  /**
   * Process individual RSS feed
   * @param {Object} feed - Feed configuration
   * @returns {Promise<void>}
   */
  async processFeed(feed) {
    this.logger.debug(`Processing feed: ${feed.url}`);

    const data = await this.parser.parseURL(feed.url);
    this.logger.debug(`Feed processed: ${feed.url}`, { itemCount: data.items.length });

    for (const item of data.items) {
      if (!item.link) {
        this.logger.warn(`Skipping item without link: ${item.title}`);
        continue;
      }

      await this.processFeedItem(item, feed);
    }
  }

  /**
   * Process individual feed item
   * @param {Object} item - RSS item
   * @param {Object} feed - Feed configuration
   * @returns {Promise<void>}
   */
  async processFeedItem(item, feed) {
    try {
      const result = await this.handleDBOperation(
        () => this.upsertNewsItem(item, feed),
        `upsert-news-item-${item.link}`
      );

      if (result.upsertedCount > 0) {
        await this.handleNewNewsItem(item, feed);
      } else if (result.modifiedCount > 0) {
        this.processingStats.totalUpdated++;
      }

      this.processingStats.totalProcessed++;
    } catch (error) {
      this.logger.error(`Failed to process item: ${item.title}`, error);
      this.processingStats.errors.push({
        item: item.title,
        error: error.message
      });
    }
  }

  /**
   * Upsert news item in database
   * @param {Object} item - RSS item
   * @param {Object} feed - Feed configuration
   * @returns {Promise<Object>} - MongoDB update result
   */
  async upsertNewsItem(item, feed) {
    const newsData = {
      title: item.title,
      description: item.contentSnippet || "",
      content: item.content || "",
      language: feed.language,
      category: feed.category,
      source: feed.source,
      sourceUrl: item.link,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      createdAt: new Date()
    };

    return await this.model.updateOne(
      { sourceUrl: item.link },
      { $setOnInsert: newsData },
      { upsert: true }
    );
  }

  /**
   * Handle new news item
   * @param {Object} item - RSS item
   * @param {Object} feed - Feed configuration
   * @returns {Promise<void>}
   */
  async handleNewNewsItem(item, feed) {
    try {
      const newNews = await this.findOne({ sourceUrl: item.link });
      
      if (newNews) {
        this.processingStats.totalInserted++;
        
        // Emit socket event if global.io is available
        if (global.io) {
          global.io.emit("news:new", newNews);
          this.logger.debug('Emitted news:new event', { title: newNews.title });
        }

        // Track search trends
        await this.trackSearchTrends(newNews);
      }
    } catch (error) {
      this.logger.error('Failed to handle new news item', error);
    }
  }

  /**
   * Track search trends based on news content
   * @param {Object} news - News document
   * @returns {Promise<void>}
   */
  async trackSearchTrends(news) {
    try {
      const keywords = this.extractKeywords(news);
      
      for (const keyword of keywords) {
        await this.updateSearchTrend(keyword);
      }
    } catch (error) {
      this.logger.error('Failed to track search trends', error);
    }
  }

  /**
   * Extract keywords from news content
   * @param {Object} news - News document
   * @returns {Array<string>} - Extracted keywords
   */
  extractKeywords(news) {
    const text = `${news.title} ${news.description} ${news.content}`.toLowerCase();
    
    // Simple keyword extraction - could be enhanced with NLP
    const words = text.split(/\s+/).filter(word => word.length > 3);
    const uniqueWords = [...new Set(words)];
    
    return uniqueWords.slice(0, 5); // Return top 5 keywords
  }

  /**
   * Update search trend for a keyword
   * @param {string} keyword - Search keyword
   * @returns {Promise<void>}
   */
  async updateSearchTrend(keyword) {
    try {
      await SearchTrend.findOneAndUpdate(
        { query: keyword },
        { 
          $inc: { count: 1 },
          $set: { lastSearchedAt: new Date() }
        },
        { upsert: true }
      );
    } catch (error) {
      this.logger.error(`Failed to update search trend for: ${keyword}`, error);
    }
  }

  /**
   * Get processing statistics
   * @returns {Object} - Processing statistics
   */
  getStats() {
    return { ...this.processingStats };
  }

  /**
   * Reset processing statistics
   */
  resetStats() {
    this.processingStats = {
      totalProcessed: 0,
      totalInserted: 0,
      totalUpdated: 0,
      errors: []
    };
  }

  /**
   * Get feed health status
   * @returns {Promise<Array>} - Feed health status
   */
  async getFeedHealth() {
    const healthStatus = [];

    for (const feed of this.sources) {
      try {
        const data = await this.parser.parseURL(feed.url);
        healthStatus.push({
          url: feed.url,
          status: 'healthy',
          itemCount: data.items.length,
          lastChecked: new Date()
        });
      } catch (error) {
        healthStatus.push({
          url: feed.url,
          status: 'error',
          error: error.message,
          lastChecked: new Date()
        });
      }
    }

    return healthStatus;
  }
}

// Export singleton instance
const rssService = new RSSService();
module.exports = rssService;
