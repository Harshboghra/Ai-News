/**
 * Main Type Definitions Index
 * Centralized exports for all TypeScript types
 */

// Component types
export * from "./components";

// API types (defined locally to avoid import issues)
export interface NewsItem {
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
  
  // 🤖 AI-Generated Content Fields
  aiSummary?: string;
  aiContent?: string;
  slug?: string;
  readingTime?: number;
  aiStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  aiMetadata?: {
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    processingTime?: number;
    confidence?: number;
  };
  priority?: number;
  
  // 📊 Content Analytics
  views?: number;
  engagement?: number;
  
  // 📅 Timestamps
  updatedAt?: string;
  aiProcessedAt?: string;
  
  // 📰 Original Source Data (Reference Only)
  originalTitle?: string;
  originalDescription?: string;
}

export interface SearchResponse {
  detectedLanguage: string;
  results: NewsItem[];
  strategy: "success" | "fallback";
}

export interface LatestResponse {
  count: number;
  results: NewsItem[];
}

export interface SuggestionsResponse {
  suggestions: string[];
  count: number;
}


export interface CategoryResponse {
  categories: string[];
  count: number;
}

export interface SourceResponse {
  sources: string[];
  count: number;
}

export interface DateRangeResponse {
  results: NewsItem[];
  startDate: string;
  endDate: string;
  count: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  code?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface NewsAPIResponse {
  results: NewsItem[];
  detectedLanguage: string;
  strategy: "success" | "fallback";
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Type guards
export function isNewsItem(obj: any): obj is NewsItem {
  return (
    obj &&
    (obj.id || obj._id) &&
    obj.title &&
    obj.description &&
    obj.source &&
    obj.publishedAt
  );
}

export function isSearchResponse(obj: any): obj is SearchResponse {
  return (
    obj && obj.detectedLanguage && Array.isArray(obj.results) && obj.strategy
  );
}

export function isLatestResponse(obj: any): obj is LatestResponse {
  return obj && typeof obj.count === "number" && Array.isArray(obj.results);
}

export function isAPIResponse<T = any>(obj: any): obj is APIResponse<T> {
  return obj && typeof obj.success === "boolean";
}
