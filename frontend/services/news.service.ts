/**
 * News Service
 * Centralized news-related API methods with proper error handling
 */

import { apiService } from "./base";

class NewsService {
  /**
   * Search for news articles
   * @param query - Search query
   * @param options - Search options
   * @returns Search results
   */
  async searchNews(query: string, options: any = {}) {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query cannot be empty");
    }

    const params = {
      q: query.trim(),
      limit: options.limit || 20,
      language: options.language || "en",
    };

    return apiService.get("/api/news/search", params);
  }

  /**
   * Get latest news articles
   * @param options - Options
   * @returns Latest news results
   */
  async getLatestNews(options: any = {}) {
    const params = {
      limit: options.limit || 20,
      language: options.language || "en",
    };

    return apiService.get("/api/news/latest", params);
  }

  /**
   * Get search suggestions
   * @param query - Search query
   * @param options - Options
   * @returns Search suggestions
   */
  async getSuggestions(query: string, options: any = {}) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const params = {
      q: query.trim(),
      limit: options.limit || 8,
      language: options.language || "en",
    };

    return apiService.get("/api/news/suggest", params);
  }

  /**
   * Get trending searches
   * @param options - Options
   * @returns Trending searches
   */
  async getTrending(options: any = {}) {
    const params = {
      limit: options.limit || 8,
    };

    return apiService.get("/api/news/trending", params);
  }

  /**
   * Get news by category
   * @param category - News category
   * @param options - Options
   * @returns Category news results
   */
  async getByCategory(category: string, options: any = {}) {
    if (!category) {
      throw new Error("Category cannot be empty");
    }

    const params = {
      category: category.trim(),
      limit: options.limit || 20,
      language: options.language || "en",
      page: options?.page || 1,
    };

    return apiService.get("/api/news/category", params);
  }

  /**
   * Get news by source
   * @param source - News source
   * @param options - Options
   * @returns Source news results
   */
  async getBySource(source: string, options: any = {}) {
    if (!source) {
      throw new Error("Source cannot be empty");
    }

    const params = {
      source: source.trim(),
      limit: options.limit || 20,
      language: options.language || "en",
      page: options?.page || 1,
    };

    return apiService.get("/api/news/source", params);
  }

  /**
   * Get news by date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param options - Options
   * @returns Date range news results
   */
  async getByDateRange(
    startDate: string | Date,
    endDate: string | Date,
    options: any = {}
  ) {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }

    const params = {
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      limit: options.limit || 20,
      language: options.language || "en",
    };

    return apiService.get("/api/news/date-range", params);
  }
}

// Export singleton instance
export const newsService = new NewsService();
export default newsService;
