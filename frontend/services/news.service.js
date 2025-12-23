/**
 * News Service
 * Centralized news-related API methods with proper error handling
 */

import { apiService } from './base';

class NewsService {
  /**
   * Search for news articles
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {number} options.limit - Number of results to return
   * @param {string} options.language - Language filter
   * @returns {Promise<Object>} - Search results
   */
  async searchNews(query, options = {}) {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    const params = {
      q: query.trim(),
      limit: options.limit || 20,
      language: options.language || 'en'
    };

    return apiService.get('/api/news/search', params);
  }

  /**
   * Get latest news articles
   * @param {Object} options - Options
   * @param {number} options.limit - Number of results to return
   * @param {string} options.language - Language filter
   * @returns {Promise<Object>} - Latest news results
   */
  async getLatestNews(options = {}) {
    const params = {
      limit: options.limit || 20,
      language: options.language || 'en'
    };

    return apiService.get('/api/news/latest', params);
  }

  /**
   * Get search suggestions
   * @param {string} query - Search query
   * @param {Object} options - Options
   * @param {number} options.limit - Number of suggestions to return
   * @param {string} options.language - Language filter
   * @returns {Promise<Array>} - Search suggestions
   */
  async getSuggestions(query, options = {}) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const params = {
      q: query.trim(),
      limit: options.limit || 8,
      language: options.language || 'en'
    };

    return apiService.get('/api/news/suggest', params);
  }

  /**
   * Get trending searches
   * @param {Object} options - Options
   * @param {number} options.limit - Number of trends to return
   * @returns {Promise<Array>} - Trending searches
   */
  async getTrending(options = {}) {
    const params = {
      limit: options.limit || 8
    };

    return apiService.get('/api/news/trending', params);
  }

  /**
   * Get news by category
   * @param {string} category - News category
   * @param {Object} options - Options
   * @param {number} options.limit - Number of results to return
   * @param {string} options.language - Language filter
   * @returns {Promise<Object>} - Category news results
   */
  async getByCategory(category, options = {}) {
    if (!category) {
      throw new Error('Category cannot be empty');
    }

    const params = {
      category: category.trim(),
      limit: options.limit || 20,
      language: options.language || 'en'
    };

    return apiService.get('/api/news/category', params);
  }

  /**
   * Get news by source
   * @param {string} source - News source
   * @param {Object} options - Options
   * @param {number} options.limit - Number of results to return
   * @param {string} options.language - Language filter
   * @returns {Promise<Object>} - Source news results
   */
  async getBySource(source, options = {}) {
    if (!source) {
      throw new Error('Source cannot be empty');
    }

    const params = {
      source: source.trim(),
      limit: options.limit || 20,
      language: options.language || 'en'
    };

    return apiService.get('/api/news/source', params);
  }

  /**
   * Get news by date range
   * @param {string|Date} startDate - Start date
   * @param {string|Date} endDate - End date
   * @param {Object} options - Options
   * @param {number} options.limit - Number of results to return
   * @param {string} options.language - Language filter
   * @returns {Promise<Object>} - Date range news results
   */
  async getByDateRange(startDate, endDate, options = {}) {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    const params = {
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      limit: options.limit || 20,
      language: options.language || 'en'
    };

    return apiService.get('/api/news/date-range', params);
  }
}

// Export singleton instance
export const newsService = new NewsService();
export default newsService;
