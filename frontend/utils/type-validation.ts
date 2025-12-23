/**
 * Runtime Type Validation Utilities
 * Type guards and validation functions for runtime type checking
 */

// Define local types to avoid import issues
interface NewsItem {
  id: string;
  _id: string;
  title: string;
  description: string;
  content: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  language: string;
  category?: string;
  tags?: string[];
  finalScore?: number;
}

interface SearchResponse {
  detectedLanguage: string;
  results: NewsItem[];
  strategy: "success" | "fallback";
}

interface LatestResponse {
  count: number;
  results: NewsItem[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  code?: number;
  pagination?: PaginationInfo;
}

/**
 * Enhanced type guards with detailed validation
 */
export class TypeValidator {
  /**
   * Validate and cast to NewsItem
   * @param obj - Object to validate
   * @param strict - Whether to perform strict validation
   * @returns Validated NewsItem or null
   */
  static validateNewsItem(obj: any, strict: boolean = false): NewsItem | null {
    if (!obj) return null;

    // Required fields
    if (!obj.title || typeof obj.title !== "string") return null;
    if (!obj.description || typeof obj.description !== "string") return null;
    if (!obj.source || typeof obj.source !== "string") return null;
    if (!obj.publishedAt) return null;

    // Optional fields with defaults
    const validatedItem: NewsItem = {
      id: obj.id || obj._id?.toString() || "",
      _id: obj._id?.toString() || obj.id || "",
      title: obj.title.trim(),
      description: obj.description.trim(),
      content: obj.content || "",
      source: obj.source.trim(),
      sourceUrl: obj.sourceUrl || "",
      publishedAt:
        typeof obj.publishedAt === "string"
          ? obj.publishedAt
          : obj.publishedAt
          ? new Date(obj.publishedAt).toISOString()
          : new Date().toISOString(),
      language: obj.language || "en",
      category: obj.category,
      tags: Array.isArray(obj.tags)
        ? obj.tags.filter((tag: any) => typeof tag === "string")
        : undefined,
      finalScore:
        typeof obj.finalScore === "number" ? obj.finalScore : undefined,
    };

    return validatedItem;
  }

  /**
   * Validate and cast to SearchResponse
   * @param obj - Object to validate
   * @returns Validated SearchResponse or null
   */
  static validateSearchResponse(obj: any): SearchResponse | null {
    if (!obj || typeof obj !== "object") return null;

    if (!obj.detectedLanguage || typeof obj.detectedLanguage !== "string")
      return null;
    if (!Array.isArray(obj.results)) return null;

    const validatedResults = obj.results
      .map((item: any) => this.validateNewsItem(item))
      .filter((item: NewsItem | null) => item !== null) as NewsItem[];

    return {
      detectedLanguage: obj.detectedLanguage,
      results: validatedResults,
      strategy: obj.strategy || "fallback",
    };
  }

  /**
   * Validate and cast to LatestResponse
   * @param obj - Object to validate
   * @returns Validated LatestResponse or null
   */
  static validateLatestResponse(obj: any): LatestResponse | null {
    if (!obj || typeof obj !== "object") return null;

    if (typeof obj.count !== "number") return null;
    if (!Array.isArray(obj.results)) return null;

    const validatedResults = obj.results
      .map((item: any) => this.validateNewsItem(item))
      .filter((item: NewsItem | null) => item !== null) as NewsItem[];

    return {
      count: obj.count,
      results: validatedResults,
    };
  }

  /**
   * Validate and cast to APIResponse
   * @param obj - Object to validate
   * @returns Validated APIResponse or null
   */
  static validateAPIResponse<T = any>(obj: any): APIResponse<T> | null {
    if (!obj || typeof obj !== "object") return null;

    if (typeof obj.success !== "boolean") return null;

    return {
      success: obj.success,
      data: obj.data,
      message: obj.message,
      errors: Array.isArray(obj.errors) ? obj.errors : undefined,
      code: typeof obj.code === "number" ? obj.code : undefined,
      pagination:
        obj.pagination && typeof obj.pagination === "object"
          ? obj.pagination
          : undefined,
    };
  }

  /**
   * Safely extract NewsItem array from response
   * @param response - Response object
   * @returns Array of validated NewsItem
   */
  static extractNewsItems(response: any): NewsItem[] {
    if (!response) return [];

    // Try different response structures
    let items: any[] = [];

    if (Array.isArray(response)) {
      items = response;
    } else if (response.results && Array.isArray(response.results)) {
      items = response.results;
    } else if (response.data && Array.isArray(response.data)) {
      items = response.data;
    } else if (
      response.data &&
      response.data.results &&
      Array.isArray(response.data.results)
    ) {
      items = response.data.results;
    }

    return items
      .map((item) => this.validateNewsItem(item))
      .filter((item): item is NewsItem => item !== null);
  }

  /**
   * Validate news item array
   * @param items - Array to validate
   * @returns Array of validated NewsItem
   */
  static validateNewsItemArray(items: any): NewsItem[] {
    if (!Array.isArray(items)) return [];
    return items
      .map((item) => this.validateNewsItem(item))
      .filter((item): item is NewsItem => item !== null);
  }

  /**
   * Check if object matches NewsItem structure
   * @param obj - Object to check
   * @returns True if object is NewsItem-like
   */
  static isNewsItemLike(obj: any): boolean {
    return (
      obj &&
      (obj.id || obj._id) &&
      obj.title &&
      obj.description &&
      obj.source &&
      obj.publishedAt
    );
  }

  /**
   * Sanitize and validate data recursively
   * @param data - Data to sanitize
   * @param schema - Validation schema
   * @returns Sanitized data
   */
  static sanitizeData(data: any, schema?: any): any {
    if (!data || typeof data !== "object") return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item, schema));
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (schema && schema[key]) {
        const fieldSchema = schema[key];
        sanitized[key] = this.validateField(value, fieldSchema);
      } else {
        // Basic sanitization
        if (typeof value === "string") {
          sanitized[key] = value.trim();
        } else if (typeof value === "object") {
          sanitized[key] = this.sanitizeData(value);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Validate individual field
   * @param value - Value to validate
   * @param schema - Field schema
   * @returns Validated value
   */
  private static validateField(value: any, schema: any): any {
    const { type, required, default: defaultValue, min, max, pattern } = schema;

    // Handle null/undefined
    if ((value === null || value === undefined) && required) {
      return defaultValue;
    }

    // Type validation
    switch (type) {
      case "string":
        if (typeof value !== "string") return defaultValue || "";
        if (pattern && !pattern.test(value)) return defaultValue || "";
        return value.trim();

      case "number":
        const num = Number(value);
        if (isNaN(num)) return defaultValue || 0;
        if (min !== undefined && num < min) return min;
        if (max !== undefined && num > max) return max;
        return num;

      case "boolean":
        return Boolean(value);

      case "date":
        const date = new Date(value as string | number | Date);
        if (isNaN(date.getTime())) return defaultValue || new Date();
        return date;

      case "array":
        if (!Array.isArray(value)) return defaultValue || [];
        return value;

      default:
        return value;
    }
  }
}

/**
 * Data transformation utilities
 */
export class DataTransformer {
  /**
   * Transform backend response to frontend format
   * @param response - Backend response
   * @returns Transformed data
   */
  static transformBackendResponse(response: any): any {
    if (!response) return response;

    // Transform nested objects
    if (Array.isArray(response)) {
      return response.map((item) => this.transformBackendResponse(item));
    }

    if (typeof response === "object") {
      const transformed: any = {};

      for (const [key, value] of Object.entries(response) as [string, any][]) {
        // Transform MongoDB ObjectId
        if (key === "_id" && value && typeof value === "object") {
          transformed.id = value.toString();
          transformed._id = value.toString();
        } else if (key === "publishedAt" && value) {
          // Ensure date is ISO string
          transformed[key] =
            typeof value === "string" ? value : new Date(value).toISOString();
        } else if (typeof value === "object" && value !== null) {
          transformed[key] = this.transformBackendResponse(value);
        } else {
          transformed[key] = value;
        }
      }

      return transformed;
    }

    return response;
  }

  /**
   * Normalize API response format
   * @param response - Raw API response
   * @returns Normalized response
   */
  static normalizeAPIResponse(response: any): any {
    // Handle different response formats
    if (response && typeof response === "object") {
      // Direct data format
      if (response.results || response.data) {
        return response;
      }

      // Wrapped response format
      if (response.success !== undefined) {
        return response.data || response;
      }

      // Raw array format
      if (Array.isArray(response)) {
        return { results: response, count: response.length };
      }
    }

    return response;
  }
}

/**
 * Error boundary utilities
 */
export class ErrorBoundary {
  private static errors: Error[] = [];
  private static maxErrors = 100;

  /**
   * Capture and store error
   * @param error - Error to capture
   * @param context - Error context
   */
  static captureError(error: Error, context?: any): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      context,
      timestamp: new Date(),
      stack: error.stack,
    };

    this.errors.unshift(errorInfo as any);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log error
    console.error("Error captured:", errorInfo);
  }

  /**
   * Get recent errors
   * @param limit - Number of errors to return
   * @returns Array of recent errors
   */
  static getRecentErrors(limit: number = 10): any[] {
    return this.errors.slice(0, limit);
  }

  /**
   * Clear error history
   */
  static clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get error statistics
   * @returns Error statistics
   */
  static getErrorStats(): {
    total: number;
    recent: number;
    types: Record<string, number>;
  } {
    const types: Record<string, number> = {};

    this.errors.forEach((errorInfo: any) => {
      const type = errorInfo.name || "Unknown";
      types[type] = (types[type] || 0) + 1;
    });

    return {
      total: this.errors.length,
      recent: this.errors.filter(
        (e: any) => Date.now() - e.timestamp.getTime() < 3600000
      ).length, // Last hour
      types,
    };
  }
}

// Export enhanced type guards
export const {
  validateNewsItem,
  validateSearchResponse,
  validateLatestResponse,
  validateAPIResponse,
  extractNewsItems,
  validateNewsItemArray,
  isNewsItemLike,
  sanitizeData,
} = TypeValidator;

export const { transformBackendResponse, normalizeAPIResponse } =
  DataTransformer;

export const { captureError, getRecentErrors, clearErrors, getErrorStats } =
  ErrorBoundary;
