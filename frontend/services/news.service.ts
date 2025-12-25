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
   * Get latest news articles with pagination
   * @param options - Options including page
   * @returns Latest news results
   */
  async getLatestNews(options: any = {}) {
    const params = {
      limit: options.limit || 20,
      language: options.language || "en",
      page: options.page || 1,
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
   * Get news by category with pagination support
   * @param category - News category
   * @param options - Options including page and limit
   * @returns Category news results with pagination info
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
   * Get news by source with pagination support
   * @param source - News source
   * @param options - Options including page and limit
   * @returns Source news results with pagination info
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

  /**
   * Load more news for infinite scroll - Category
   * @param category - News category
   * @param currentPage - Current page number
   * @param options - Additional options
   * @returns Next page of category news
   */
  async loadMoreCategoryNews(category: string, currentPage: number, options: any = {}) {
    return this.getByCategory(category, {
      ...options,
      page: currentPage + 1
    });
  }

  /**
   * Load more news for infinite scroll - Source
   * @param source - News source
   * @param currentPage - Current page number
   * @param options - Additional options
   * @returns Next page of source news
   */
  async loadMoreSourceNews(source: string, currentPage: number, options: any = {}) {
    return this.getBySource(source, {
      ...options,
      page: currentPage + 1
    });
  }

  /**
   * Load more news for infinite scroll - Search
   * @param query - Search query
   * @param currentPage - Current page number
   * @param options - Additional options
   * @returns Next page of search results
   */
  async loadMoreSearchNews(query: string, currentPage: number, options: any = {}) {
    return this.searchNews(query, {
      ...options,
      page: currentPage + 1
    });
  }

  /**
   * Load more news for infinite scroll - Latest
   * @param currentPage - Current page number
   * @param options - Additional options
   * @returns Next page of latest news
   */
  async loadMoreLatestNews(currentPage: number, options: any = {}) {
    return this.getLatestNews({
      ...options,
      page: currentPage + 1
    });
  }
}

// Export singleton instance
export const newsService = new NewsService();
export default newsService;
