/**
 * Search Service
 * Centralized search logic with multiple search strategies and performance optimization
 */

const BaseService = require("./base.service");
const News = require("../models/News");
const SearchTrend = require("../models/SearchTrend");
const detectLanguage = require("../utils/language");
const {
  getRecencyScore,
  getCategoryScore,
  getSourceScore,
  getExactMatchScore
} = require("../utils/ranking");
const trackSearch = require("../utils/trackSearch");

class SearchService extends BaseService {
  constructor() {
    super(News);
    this.searchStrategies = {
      EXACT_MATCH: 'exact',
      FUZZY_MATCH: 'fuzzy',
      LANGUAGE_SPECIFIC: 'language',
      FALLBACK_ENGLISH: 'fallback'
    };
  }

  /**
   * Perform search with multiple strategies and pagination
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {number} options.limit - Result limit
   * @param {string} options.language - Preferred language
   * @param {number} options.page - Page number for pagination
   * @returns {Promise<Object>} - Search results with pagination
   */
  async searchNews(query, options = {}) {
    const { limit = 20, language = 'en', page = 1 } = options;
    const pageNum = parseInt(page);

    if (!query || !query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    const trimmedQuery = query.trim();
    const detectedLanguage = detectLanguage(trimmedQuery);

    this.logger.info('Starting paginated search', {
      query: trimmedQuery,
      detectedLanguage,
      preferredLanguage: language,
      page: pageNum,
      limit
    });

    // Track search trend
    trackSearch(trimmedQuery);

    // Try different search strategies with pagination
    const strategies = this.getSearchStrategies(trimmedQuery, detectedLanguage, language);
    let results = [];

    for (const strategy of strategies) {
      results = await this.executeSearchStrategyWithPagination(strategy, trimmedQuery, limit, pageNum);

      if (results.length > 0) {
        this.logger.info(`Search successful with strategy: ${strategy.type}`, {
          resultCount: results.length,
          page: pageNum
        });
        break;
      }
    }

    // If no results found, try fallback strategies
    if (results.length === 0) {
      results = await this.executeFallbackSearchWithPagination(trimmedQuery, limit, pageNum);
    }

    return {
      detectedLanguage,
      results: results.slice(0, limit),
      strategy: results.length > 0 ? 'success' : 'fallback',
      page: pageNum,
      limit: parseInt(limit)
    };
  }

  /**
   * Get search strategies based on query and language
   * @param {string} query - Search query
   * @param {string} detectedLanguage - Detected language
   * @param {string} preferredLanguage - Preferred language
   * @returns {Array} - Search strategies
   */
  getSearchStrategies(query, detectedLanguage, preferredLanguage) {
    const strategies = [];

    // Exact match strategy
    strategies.push({
      type: this.searchStrategies.EXACT_MATCH,
      language: preferredLanguage,
      query: query
    });

    // Fuzzy match strategy
    strategies.push({
      type: this.searchStrategies.FUZZY_MATCH,
      language: preferredLanguage,
      query: query
    });

    // Language-specific strategy if different from preferred
    if (detectedLanguage !== preferredLanguage) {
      strategies.push({
        type: this.searchStrategies.LANGUAGE_SPECIFIC,
        language: detectedLanguage,
        query: query
      });
    }

    // Fallback to English
    if (preferredLanguage !== 'en') {
      strategies.push({
        type: this.searchStrategies.FALLBACK_ENGLISH,
        language: 'en',
        query: query
      });
    }

    return strategies;
  }

  /**
   * Execute specific search strategy
   * @param {Object} strategy - Search strategy
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} - Search results
   */
  async executeSearchStrategy(strategy, query, limit) {
    try {
      switch (strategy.type) {
        case this.searchStrategies.EXACT_MATCH:
          return await this.searchWithExactMatch(query, strategy.language, limit);

        case this.searchStrategies.FUZZY_MATCH:
          return await this.searchWithFuzzyMatch(query, strategy.language, limit);

        case this.searchStrategies.LANGUAGE_SPECIFIC:
          return await this.searchWithLanguage(query, strategy.language, limit);

        case this.searchStrategies.FALLBACK_ENGLISH:
          return await this.searchWithLanguage(query, 'en', limit);

        default:
          return [];
      }
    } catch (error) {
      this.logger.error(`Search strategy failed: ${strategy.type}`, error);
      return [];
    }
  }

  /**
   * Execute specific search strategy with pagination
   * @param {Object} strategy - Search strategy
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @param {number} page - Page number
   * @returns {Promise<Array>} - Search results
   */
  async executeSearchStrategyWithPagination(strategy, query, limit, page) {
    try {
      switch (strategy.type) {
        case this.searchStrategies.EXACT_MATCH:
          return await this.searchWithExactMatchPaginated(query, strategy.language, limit, page);

        case this.searchStrategies.FUZZY_MATCH:
          return await this.searchWithFuzzyMatchPaginated(query, strategy.language, limit, page);

        case this.searchStrategies.LANGUAGE_SPECIFIC:
          return await this.searchWithLanguagePaginated(query, strategy.language, limit, page);

        case this.searchStrategies.FALLBACK_ENGLISH:
          return await this.searchWithLanguagePaginated(query, 'en', limit, page);

        default:
          return [];
      }
    } catch (error) {
      this.logger.error(`Search strategy failed: ${strategy.type}`, error);
      return [];
    }
  }

  /**
   * Execute fallback search strategies
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} - Search results
   */
  async executeFallbackSearch(query, limit) {
    this.logger.info('Executing fallback search strategies');

    // Try broader search without language filter
    const broadResults = await this.searchWithFuzzyMatch(query, null, limit * 2);
    if (broadResults.length > 0) {
      return broadResults.slice(0, limit);
    }

    // Try partial word matching
    const partialResults = await this.searchWithPartialMatch(query, limit);
    if (partialResults.length > 0) {
      return partialResults;
    }

    // Return empty results if all strategies failed
    return [];
  }

  /**
   * Execute fallback search strategies with pagination
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @param {number} page - Page number
   * @returns {Promise<Array>} - Search results
   */
  async executeFallbackSearchWithPagination(query, limit, page) {
    this.logger.info('Executing fallback search strategies with pagination');

    // Try broader search without language filter
    const broadResults = await this.searchWithFuzzyMatchPaginated(query, null, limit * 2, page);
    if (broadResults.length > 0) {
      return broadResults.slice(0, limit);
    }

    // Try partial word matching
    const partialResults = await this.searchWithPartialMatchPaginated(query, limit, page);
    if (partialResults.length > 0) {
      return partialResults;
    }

    // Return empty results if all strategies failed
    return [];
  }

  /**
   * Search with exact match
   * @param {string} query - Search query
   * @param {string} language - Language filter
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} - Search results
   */
  async searchWithExactMatch(query, language, limit) {
    const filter = this.buildSearchFilter(query, language, 'exact');
    
    const rawResults = await this.findWithPagination(filter, {
      limit: limit * 2,
      sort: { publishedAt: -1 }
    });

    return this.rankResults(rawResults.results, query);
  }

  /**
   * Search with fuzzy match
   * @param {string} query - Search query
   * @param {string} language - Language filter
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} - Search results
   */
  async searchWithFuzzyMatch(query, language, limit) {
    const filter = this.buildSearchFilter(query, language, 'fuzzy');
    
    const rawResults = await this.findWithPagination(filter, {
      limit: limit * 3,
      sort: { publishedAt: -1 }
    });

    return this.rankResults(rawResults.results, query);
  }

  /**
   * Search with language-specific filtering
   * @param {string} query - Search query
   * @param {string} language - Language filter
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} - Search results
   */
  async searchWithLanguage(query, language, limit) {
    const filter = this.buildSearchFilter(query, language, 'fuzzy');
    
    const rawResults = await this.findWithPagination(filter, {
      limit: limit * 2,
      sort: { publishedAt: -1 }
    });

    return this.rankResults(rawResults.results, query);
  }

  /**
   * Search with partial word matching
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} - Search results
   */
  async searchWithPartialMatch(query, limit) {
    const filter = this.buildSearchFilter(query, null, 'partial');

    const rawResults = await this.findWithPagination(filter, {
      limit: limit * 2,
      sort: { publishedAt: -1 }
    });

    return this.rankResults(rawResults.results, query);
  }

  /**
   * Search with exact match and pagination
   * @param {string} query - Search query
   * @param {string} language - Language filter
   * @param {number} limit - Result limit
   * @param {number} page - Page number
   * @returns {Promise<Array>} - Search results
   */
  async searchWithExactMatchPaginated(query, language, limit, page) {
    const filter = this.buildSearchFilter(query, language, 'exact');

    const rawResults = await this.findWithPagination(filter, {
      limit: limit * 2,
      page: page,
      sort: { publishedAt: -1 }
    });

    return this.rankResults(rawResults.results, query);
  }

  /**
   * Search with fuzzy match and pagination
   * @param {string} query - Search query
   * @param {string} language - Language filter
   * @param {number} limit - Result limit
   * @param {number} page - Page number
   * @returns {Promise<Array>} - Search results
   */
  async searchWithFuzzyMatchPaginated(query, language, limit, page) {
    const filter = this.buildSearchFilter(query, language, 'fuzzy');

    const rawResults = await this.findWithPagination(filter, {
      limit: limit * 3,
      page: page,
      sort: { publishedAt: -1 }
    });

    return this.rankResults(rawResults.results, query);
  }

  /**
   * Search with language-specific filtering and pagination
   * @param {string} query - Search query
   * @param {string} language - Language filter
   * @param {number} limit - Result limit
   * @param {number} page - Page number
   * @returns {Promise<Array>} - Search results
   */
  async searchWithLanguagePaginated(query, language, limit, page) {
    const filter = this.buildSearchFilter(query, language, 'fuzzy');

    const rawResults = await this.findWithPagination(filter, {
      limit: limit * 2,
      page: page,
      sort: { publishedAt: -1 }
    });

    return this.rankResults(rawResults.results, query);
  }

  /**
   * Search with partial word matching and pagination
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @param {number} page - Page number
   * @returns {Promise<Array>} - Search results
   */
  async searchWithPartialMatchPaginated(query, limit, page) {
    const filter = this.buildSearchFilter(query, null, 'partial');

    const rawResults = await this.findWithPagination(filter, {
      limit: limit * 2,
      page: page,
      sort: { publishedAt: -1 }
    });

    return this.rankResults(rawResults.results, query);
  }

  /**
   * Get news by category
   * @param {string} category - News category
   * @param {Object} options - Options
   * @param {number} options.limit - Number of results to return
   * @param {string} options.language - Language filter
   * @param {number} options.page - Page number for pagination
   * @returns {Promise<Object>} - Category news results
   */
  async getByCategory(category, options = {}) {
    if (!category) {
      throw new Error('Category cannot be empty');
    }

    const params = {
      category: category.trim(),
      limit: options.limit || 20,
      language: options.language || 'en',
      page: options.page || 1
    };

    try {
      // Use the base service to find news by category
      const filter = {
        category: params.category,
        language: params.language
      };

      const result = await this.findWithPagination(filter, {
        limit: params.limit,
        page: params.page,
        sort: { publishedAt: -1 }
      });

      console.log('Pagination parameters:', {
        category: params.category,
        page: params.page,
        limit: params.limit,
        calculatedSkip: (params.page - 1) * params.limit
      });

      console.log('Category search result:', {
        category: params.category,
        page: params.page,
        limit: params.limit,
        totalCount: result.totalCount,
        resultsCount: result.results.length
      });

      return {
        category: params.category,
        news: result.results,
        pagination: {
          page: params.page,
          limit: params.limit,
          total: result.totalCount,
          hasMore: result.hasMore
        },
        stats: {
          category: params.category,
          totalNews: result.totalCount,
          todayNews: 0, // Would need additional logic to calculate
          weekNews: 0,
          monthNews: 0,
          averageScore: 0,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error('Failed to get category news', error);
      throw error;
    }
  }

  /**
   * Get all available categories
   * @param {Object} options - Options
   * @param {string} options.language - Language filter
   * @returns {Promise<Array>} - Available categories
   */
  async getCategories(options = {}) {
    const params = {
      language: options.language || 'en'
    };

    return this.request('/api/news/categories', params);
  }

  /**
   * Get category statistics
   * @param {string} category - News category
   * @param {Object} options - Options
   * @param {string} options.language - Language filter
   * @returns {Promise<Object>} - Category statistics
   */
  async getCategoryStats(category, options = {}) {
    if (!category) {
      throw new Error('Category cannot be empty');
    }

    const params = {
      category: category.trim(),
      language: options.language || 'en'
    };

    return this.request('/api/news/category/stats', params);
  }

  /**
   * Build search filter
   * @param {string} query - Search query
   * @param {string} language - Language filter
   * @param {string} strategy - Search strategy
   * @returns {Object} - MongoDB filter
   */
  buildSearchFilter(query, language, strategy) {
    const regex = this.buildSearchRegex(query, strategy);
    const filter = {
      $or: [
        { title: regex },
        { description: regex },
        { content: regex }
      ]
    };

    if (language) {
      filter.language = language;
    }

    return filter;
  }

  /**
   * Build search regex based on strategy
   * @param {string} query - Search query
   * @param {string} strategy - Search strategy
   * @returns {RegExp} - Search regex
   */
  buildSearchRegex(query, strategy) {
    switch (strategy) {
      case 'exact':
        return new RegExp(`^${query}$`, 'i');
      
      case 'fuzzy':
        return new RegExp(query, 'i');
      
      case 'partial':
        // Split query into words and search for any partial matches
        const words = query.split(/\s+/);
        const pattern = words.map(word => `(${word})`).join('|');
        return new RegExp(pattern, 'i');
      
      default:
        return new RegExp(query, 'i');
    }
  }

  /**
   * Rank search results
   * @param {Array} results - Search results
   * @param {string} query - Search query
   * @returns {Array} - Ranked results
   */
  rankResults(results, query) {
    return results
      .map(item => {
        const finalScore =
          (item.score || 0) * 5 +
          getRecencyScore(item.publishedAt) +
          getCategoryScore(query, item.category) +
          getSourceScore(item.source) +
          getExactMatchScore(query, item.title);

        return {
          ...item,
          finalScore
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  /**
   * Get search suggestions
   * @param {string} query - Search query
   * @param {Object} options - Options
   * @param {number} options.limit - Limit
   * @param {string} options.language - Language
   * @returns {Promise<Array>} - Suggestions
   */
  async getSuggestions(query, options = {}) {
    const { limit = 8, language = 'en' } = options;

    if (!query || query.trim().length < 2) {
      return [];
    }

    const filter = this.buildSearchFilter(query.trim(), language, 'fuzzy');
    
    const rawResults = await this.findWithPagination(filter, {
      limit: limit * 2,
      sort: { publishedAt: -1 },
      select: 'title source publishedAt'
    });

    return rawResults.results.slice(0, limit);
  }

  /**
   * Get trending searches
   * @param {Object} options - Options
   * @param {number} options.limit - Limit
   * @returns {Promise<Array>} - Trending searches
   */
  async getTrending(options = {}) {
    const { limit = 8 } = options;

    try {
      const trends = await SearchTrend.find()
        .sort({ count: -1, lastSearchedAt: -1 })
        .limit(limit)
        .select("query count lastSearchedAt")
        .lean();

      return trends;
    } catch (error) {
      this.logger.error('Failed to get trending searches', error);
      return [];
    }
  }

  /**
   * Get search statistics
   * @returns {Promise<Object>} - Search statistics
   */
  async getSearchStats() {
    try {
      const totalSearches = await SearchTrend.countDocuments();
      const recentSearches = await SearchTrend.countDocuments({
        lastSearchedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      const topTrends = await SearchTrend.find()
        .sort({ count: -1 })
        .limit(5)
        .select("query count")
        .lean();

      return {
        totalSearches,
        recentSearches,
        topTrends,
        lastUpdated: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to get search stats', error);
      return {
        totalSearches: 0,
        recentSearches: 0,
        topTrends: [],
        lastUpdated: new Date()
      };
    }
  }
}

// Export singleton instance
const searchService = new SearchService();
module.exports = searchService;
