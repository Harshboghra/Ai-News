/**
 * Category Type Definitions
 * TypeScript interfaces for category-based news functionality
 */

// Category types
export type NewsCategory =
  | "world"
  | "india"
  | "business"
  | "sports"
  | "technology"
  | "health"
  | "science"
  | "entertainment"
  | "startup"
  | "general";

// Category metadata
export interface CategoryInfo {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  description: string;
  priority: number;
  language: string;
}

// Category statistics
export interface CategoryStats {
  category: string;
  totalNews: number;
  todayNews: number;
  weekNews: number;
  monthNews: number;
  averageScore: number;
  lastUpdated: string;
}

// Category response
export interface CategoryResponse {
  categories: CategoryInfo[];
  total: number;
  language: string;
}

// Category news response
export interface CategoryNewsResponse {
  category: string;
  news: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  stats: CategoryStats;
}

// Health status types
export interface ServiceHealth {
  service: string;
  status: "healthy" | "warning" | "error";
  message: string;
  lastChecked: string;
  responseTime?: number;
  uptime?: number;
}

export interface SystemHealth {
  overall: "healthy" | "warning" | "error";
  services: ServiceHealth[];
  database: ServiceHealth;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    load: number;
  };
  lastUpdated: string;
}

// Health check response
export interface HealthResponse {
  system: SystemHealth;
  timestamp: string;
  version: string;
}
