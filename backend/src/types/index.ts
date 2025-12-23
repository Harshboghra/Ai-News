/**
 * Backend Type Definitions
 * Global type definitions for backend services and database models
 */

import { Document, ObjectId } from 'mongoose';

// Base interfaces
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
}

export interface PaginationResult<T> {
  results: T[];
  totalCount: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

// News related types
export interface NewsDocument extends BaseDocument {
  title: string;
  description: string;
  content: string;
  source: string;
  sourceUrl: string;
  publishedAt: Date;
  language: string;
  category?: string;
  tags?: string[];
}

export interface SearchTrendDocument extends BaseDocument {
  query: string;
  count: number;
  lastSearchedAt: Date;
}

// Service method options
export interface SearchOptions {
  limit?: number;
  language?: string;
  category?: string;
  source?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface RSSFeedOptions {
  url: string;
  language: string;
  category: string;
  source: string;
  enabled?: boolean;
  lastFetched?: Date;
  fetchInterval?: number;
}

// Service response types
export interface SearchResult {
  finalScore: number;
  detectedLanguage: string;
  results: NewsDocument[];
  strategy: 'exact' | 'fuzzy' | 'language' | 'fallback';
}

export interface RSSProcessingStats {
  totalProcessed: number;
  totalInserted: number;
  totalUpdated: number;
  errors: Array<{
    feed?: string;
    item?: string;
    error: string;
  }>;
  startTime: Date;
  endTime: Date;
  duration: number;
}

export interface FeedHealthStatus {
  url: string;
  status: 'healthy' | 'error' | 'disabled';
  itemCount?: number;
  lastChecked: Date;
  error?: string;
  responseTime?: number;
}

// Error types
export interface ServiceError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export interface ValidationError extends ServiceError {
  field: string;
  value: any;
  constraints: Record<string, string>;
}

export interface DatabaseError extends ServiceError {
  operation: string;
  collection: string;
  query?: any;
}

// Configuration types
export interface DatabaseConfig {
  uri: string;
  name: string;
  options?: {
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    connectTimeoutMS?: number;
  };
}

export interface ServerConfig {
  port: number;
  host: string;
  cors?: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit?: {
    windowMs: number;
    max: number;
  };
}

export interface RSSConfig {
  feeds: RSSFeedOptions[];
  defaultFetchInterval: number;
  maxConcurrentFetches: number;
  retryAttempts: number;
  retryDelay: number;
  userAgent: string;
  timeout: number;
}

export interface SearchConfig {
  defaultLimit: number;
  maxLimit: number;
  searchStrategies: string[];
  ranking: {
    recencyWeight: number;
    categoryWeight: number;
    sourceWeight: number;
    exactMatchWeight: number;
  };
  languageDetection: {
    enabled: boolean;
    fallbackLanguage: string;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Service method signatures
export interface NewsService {
  searchNews(query: string, options?: SearchOptions): Promise<SearchResult>;
  getLatestNews(options?: SearchOptions): Promise<PaginationResult<NewsDocument>>;
  getSuggestions(query: string, options?: SearchOptions): Promise<NewsDocument[]>;
  getByCategory(category: string, options?: SearchOptions): Promise<PaginationResult<NewsDocument>>;
  getBySource(source: string, options?: SearchOptions): Promise<PaginationResult<NewsDocument>>;
  getByDateRange(startDate: Date, endDate: Date, options?: SearchOptions): Promise<PaginationResult<NewsDocument>>;
}

export interface RSSService {
  fetchAllRSSNews(): Promise<RSSProcessingStats>;
  processFeed(feed: RSSFeedOptions): Promise<void>;
  getStats(): RSSProcessingStats;
  getFeedHealth(): Promise<FeedHealthStatus[]>;
  resetStats(): void;
}

export interface SearchService extends NewsService {
  getTrending(options?: { limit?: number }): Promise<SearchTrendDocument[]>;
  getSearchStats(): Promise<{
    totalSearches: number;
    recentSearches: number;
    topTrends: SearchTrendDocument[];
    lastUpdated: Date;
  }>;
}

export interface BaseService<T extends BaseDocument> {
  findOne(filter: Record<string, any>, options?: { select?: string; populate?: string[] }): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(filter: Record<string, any>, updateData: Record<string, any>, options?: { upsert?: boolean; new?: boolean }): Promise<T | null>;
  delete(filter: Record<string, any>): Promise<{ deletedCount: number }>;
  findWithPagination(filter: Record<string, any>, options?: PaginationOptions): Promise<PaginationResult<T>>;
  aggregate(pipeline: any[]): Promise<any[]>;
  transformDocument(document: T): Record<string, any>;
  transformDocuments(documents: T[]): Record<string, any>[];
}

// Type guards
export function isNewsDocument(obj: any): obj is NewsDocument {
  return obj &&
    obj._id &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.source === 'string' &&
    obj.publishedAt instanceof Date;
}

export function isSearchTrendDocument(obj: any): obj is SearchTrendDocument {
  return obj &&
    obj._id &&
    typeof obj.query === 'string' &&
    typeof obj.count === 'number' &&
    obj.lastSearchedAt instanceof Date;
}

export function isPaginationResult(obj: any): obj is PaginationResult<any> {
  return obj &&
    Array.isArray(obj.results) &&
    typeof obj.totalCount === 'number' &&
    typeof obj.limit === 'number' &&
    typeof obj.skip === 'number' &&
    typeof obj.hasMore === 'boolean';
}

export function isServiceError(obj: any): obj is ServiceError {
  return obj &&
    typeof obj.code === 'string' &&
    typeof obj.message === 'string';
}

export function isValidationError(obj: any): obj is ValidationError {
  return obj &&
    typeof obj.field === 'string' &&
    obj.constraints &&
    typeof obj.constraints === 'object';
}

export function isDatabaseError(obj: any): obj is DatabaseError {
  return obj &&
    typeof obj.operation === 'string' &&
    typeof obj.collection === 'string';
}

// Enum types
export enum SearchStrategy {
  EXACT_MATCH = 'exact',
  FUZZY_MATCH = 'fuzzy',
  LANGUAGE_SPECIFIC = 'language',
  FALLBACK_ENGLISH = 'fallback'
}

export enum FeedStatus {
  HEALTHY = 'healthy',
  ERROR = 'error',
  DISABLED = 'disabled'
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RSS_ERROR = 'RSS_ERROR',
  SEARCH_ERROR = 'SEARCH_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Event types
export interface ServiceEvent<T = any> {
  eventType: string;
  data: T;
  timestamp: Date;
  service: string;
  severity: 'info' | 'warn' | 'error';
}

export interface NewsCreatedEvent extends ServiceEvent<NewsDocument> {
  eventType: 'news:created';
  service: 'rss';
}

export interface SearchPerformedEvent extends ServiceEvent<{
  query: string;
  resultsCount: number;
  strategy: SearchStrategy;
  language: string;
}> {
  eventType: 'search:performed';
  service: 'search';
}

export interface ErrorOccurredEvent extends ServiceEvent<ServiceError> {
  eventType: 'error:occurred';
  service: string;
  severity: 'error';
}

// Logger types
export interface Logger {
  info(message: string, data?: any): void;
  error(message: string, error?: any): void;
  warn(message: string, data?: any): void;
  debug(message: string, data?: any): void;
}

// Configuration validation
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ConfigValidator<T> {
  validate(config: T): ConfigValidationResult;
}

// Plugin types (for future extensibility)
export interface ServicePlugin {
  name: string;
  version: string;
  init(service: any): void;
  destroy(): void;
}

export interface RSSPlugin extends ServicePlugin {
  beforeFetch(feed: RSSFeedOptions): Promise<RSSFeedOptions>;
  afterFetch(feed: RSSFeedOptions, items: any[]): Promise<any[]>;
}

export interface SearchPlugin extends ServicePlugin {
  beforeSearch(query: string, options: SearchOptions): Promise<{ query: string; options: SearchOptions }>;
  afterSearch(query: string, results: NewsDocument[]): Promise<NewsDocument[]>;
}
