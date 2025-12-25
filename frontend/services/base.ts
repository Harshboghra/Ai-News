/**
 * Base API Service
 * Centralized HTTP client with common configuration and error handling
 */

class BaseAPIService {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3032';
    this.timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000');
    this.headers = {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0'
    };
  }

  /**
   * Make HTTP request with common configuration
   * @param endpoint - API endpoint
   * @param options - Fetch options
   * @returns Fetch promise
   */
  async request(endpoint: string, options: any = {}) {
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
    } catch (error: any) {
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
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns Fetch promise
   */
  async get(endpoint: string, params: any = {}) {
    const queryString = this.buildQueryString(params);
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns Fetch promise
   */
  async post(endpoint: string, data: any = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns Fetch promise
   */
  async put(endpoint: string, data: any = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @returns Fetch promise
   */
  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  /**
   * Build query string from object
   * @param params - Query parameters
   * @returns Query string
   */
  buildQueryString(params: any) {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
  status: number;
  statusText: string;
  data: any;

  constructor(status: number, statusText: string, data: any) {
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
