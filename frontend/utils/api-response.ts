/**
 * API Response Utilities
 * Standardized response format and utilities for API responses
 */

// Define local types to avoid import issues
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  code?: number;
  pagination?: PaginationInfo;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface APIError {
  code: number;
  message: string;
  details?: any;
}

/**
 * API Response Wrapper Class
 * Provides standardized response formatting across the application
 */
export class APIResponseWrapper {
  /**
   * Create a success response
   * @param data - Response data
   * @param message - Optional success message
   * @returns Standardized success response
   */
  static success<T = any>(data: T, message?: string): APIResponse<T> {
    return {
      success: true,
      data,
      message,
      code: 200,
    };
  }

  /**
   * Create an error response
   * @param message - Error message
   * @param code - HTTP status code
   * @param details - Additional error details
   * @returns Standardized error response
   */
  static error(
    message: string,
    code: number = 500,
    details?: any
  ): APIResponse<null> {
    return {
      success: false,
      message,
      code,
      errors: [message],
      data: null,
    };
  }

  /**
   * Create a paginated response
   * @param data - Response data array
   * @param pagination - Pagination information
   * @param message - Optional success message
   * @returns Standardized paginated response
   */
  static withPagination<T = any>(
    data: T[],
    pagination: PaginationInfo,
    message?: string
  ): APIResponse<T[]> {
    return {
      success: true,
      data,
      pagination,
      message,
      code: 200,
    };
  }

  /**
   * Create a validation error response
   * @param errors - Validation errors array
   * @param message - General validation message
   * @returns Standardized validation error response
   */
  static validationError(
    errors: string[],
    message: string = "Validation failed"
  ): APIResponse<null> {
    return {
      success: false,
      message,
      code: 400,
      errors,
      data: null,
    };
  }

  /**
   * Create a not found response
   * @param resource - Name of the resource that was not found
   * @returns Standardized not found response
   */
  static notFound(resource: string = "Resource"): APIResponse<null> {
    return {
      success: false,
      message: `${resource} not found`,
      code: 404,
      errors: [`${resource} not found`],
      data: null,
    };
  }

  /**
   * Create an unauthorized response
   * @param message - Optional unauthorized message
   * @returns Standardized unauthorized response
   */
  static unauthorized(
    message: string = "Unauthorized access"
  ): APIResponse<null> {
    return {
      success: false,
      message,
      code: 401,
      errors: [message],
      data: null,
    };
  }

  /**
   * Create a forbidden response
   * @param message - Optional forbidden message
   * @returns Standardized forbidden response
   */
  static forbidden(message: string = "Access forbidden"): APIResponse<null> {
    return {
      success: false,
      message,
      code: 403,
      errors: [message],
      data: null,
    };
  }

  /**
   * Create a rate limit response
   * @param retryAfter - Seconds to wait before retrying
   * @returns Standardized rate limit response
   */
  static rateLimit(retryAfter: number = 60): APIResponse<null> {
    return {
      success: false,
      message: "Rate limit exceeded",
      code: 429,
      errors: [`Rate limit exceeded. Retry after ${retryAfter} seconds.`],
      data: null,
    };
  }

  /**
   * Create a server error response
   * @param message - Server error message
   * @param details - Additional error details
   * @returns Standardized server error response
   */
  static serverError(
    message: string = "Internal server error",
    details?: any
  ): APIResponse<null> {
    return {
      success: false,
      message,
      code: 500,
      errors: [message],
      data: details ? null : null,
    };
  }
}

/**
 * Response validation utilities
 */
export class ResponseValidator {
  /**
   * Validate if response is a successful APIResponse
   * @param response - Response to validate
   * @returns True if response is valid success response
   */
  static isSuccessResponse<T = any>(response: any): response is APIResponse<T> {
    return (
      response &&
      typeof response.success === "boolean" &&
      response.success === true &&
      (response.code === undefined || response.code === 200)
    );
  }

  /**
   * Validate if response is an error APIResponse
   * @param response - Response to validate
   * @returns True if response is valid error response
   */
  static isErrorResponse(response: any): response is APIResponse<null> {
    return (
      response &&
      typeof response.success === "boolean" &&
      response.success === false &&
      typeof response.code === "number" &&
      response.code >= 400
    );
  }

  /**
   * Validate if response has pagination data
   * @param response - Response to validate
   * @returns True if response has valid pagination
   */
  static hasPagination(
    response: any
  ): response is APIResponse<any> & { pagination: PaginationInfo } {
    return !!(
      ResponseValidator.isSuccessResponse(response) &&
      response.pagination &&
      typeof response.pagination.page === "number" &&
      typeof response.pagination.limit === "number" &&
      typeof response.pagination.total === "number" &&
      typeof response.pagination.hasMore === "boolean"
    );
  }

  /**
   * Extract data from APIResponse safely
   * @param response - API response
   * @param defaultValue - Default value if extraction fails
   * @returns Extracted data or default value
   */
  static extractData<T = any>(
    response: any,
    defaultValue: T | null = null
  ): T | null {
    if (ResponseValidator.isSuccessResponse<T>(response)) {
      return response.data || defaultValue;
    }
    return defaultValue;
  }

  /**
   * Extract error message from APIResponse
   * @param response - API response
   * @returns Error message or generic message
   */
  static extractErrorMessage(response: any): string {
    if (ResponseValidator.isErrorResponse(response)) {
      return response.message || "An error occurred";
    }
    return "Unknown error occurred";
  }

  /**
   * Extract all error messages from APIResponse
   * @param response - API response
   * @returns Array of error messages
   */
  static extractErrorMessages(response: any): string[] {
    if (ResponseValidator.isErrorResponse(response)) {
      return response.errors || [response.message || "An error occurred"];
    }
    return ["Unknown error occurred"];
  }
}

/**
 * Error transformation utilities
 */
export class ErrorTransformer {
  /**
   * Transform network error to APIError
   * @param error - Network error
   * @returns Standardized APIError
   */
  static fromNetworkError(error: any): APIError {
    return {
      code: 0,
      message: error.message || "Network error occurred",
      details: {
        originalError: error,
        type: "network",
      },
    };
  }

  /**
   * Transform validation error to APIError
   * @param error - Validation error
   * @returns Standardized APIError
   */
  static fromValidationError(error: any): APIError {
    return {
      code: 400,
      message: error.message || "Validation failed",
      details: {
        originalError: error,
        type: "validation",
        field: error.field,
        constraints: error.constraints,
      },
    };
  }

  /**
   * Transform generic error to APIError
   * @param error - Generic error
   * @param code - HTTP status code
   * @returns Standardized APIError
   */
  static fromGenericError(error: any, code: number = 500): APIError {
    return {
      code,
      message: error.message || "An error occurred",
      details: {
        originalError: error,
        type: "generic",
      },
    };
  }
}

// Export default utilities
export const {
  success,
  error,
  withPagination,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  rateLimit,
  serverError,
} = APIResponseWrapper;
export const {
  isSuccessResponse,
  isErrorResponse,
  hasPagination,
  extractData,
  extractErrorMessage,
  extractErrorMessages,
} = ResponseValidator;
export const { fromNetworkError, fromValidationError, fromGenericError } =
  ErrorTransformer;
