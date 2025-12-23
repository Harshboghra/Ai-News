/**
 * Base API Service
 * Centralized HTTP client with common configuration and error handling
 */

const config = require('../config');

class BaseAPIService {
  constructor() {
    this.baseURL = config.api.baseURL;
    this.timeout = config.api.timeout;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0'
    };
  }

  /**
   * Make HTTP request with common configuration
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise} - Fetch promise
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: { ...this.headers, ...options.headers },
      ...options
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new APIError(
          response.status,
          response.statusText,
          await response.json().catch(() => null)
        );
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new APIError(408, 'Request timeout', { message: 'The request timed out' });
      }
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(0, 'Network error', { message: error.message });
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise} - Fetch promise
   */
  async get(endpoint, params = {}) {
    const queryString = this.buildQueryString(params);
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise} - Fetch promise
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise} - Fetch promise
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} - Fetch promise
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  /**
   * Build query string from object
   * @param {Object} params - Query parameters
   * @returns {string} - Query string
   */
  buildQueryString(params) {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, value);
      }
    });

    return searchParams.toString();
  }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(status, statusText, data) {
    super(`${status}: ${statusText}`);
    this.name = 'APIError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// Export singleton instance
export const apiService = new BaseAPIService();
export default apiService;
