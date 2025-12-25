/**
 * Component Type Definitions
 * TypeScript interfaces for all React components
 */

// Define NewsItem locally to avoid import issues
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

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// NewsCard Component Props
export interface NewsCardProps extends BaseComponentProps {
  news: NewsItem;
  isNew?: boolean;
  onClick?: (news: NewsItem) => void;
}

// NewsList Component Props
export interface NewsListProps extends BaseComponentProps {
  news: NewsItem[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onNewsClick?: (news: NewsItem) => void;
  emptyStateMessage?: string;
  onLoadMoreRef?: React.RefObject<HTMLDivElement | null>;
  onRetryLoadMore?: () => void;
}

// NewsSearch Component Props
export interface NewsSearchProps extends BaseComponentProps {
  onSearch?: (query: string) => void;
  onSuggestions?: (suggestions: string[]) => void;
  isLoading?: boolean;
  placeholder?: string;
}

// SearchBar Component Props
export interface SearchBarProps extends BaseComponentProps {
  onBlend?: (query: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  blendPlaceholder?: string;
  searchPlaceholder?: string;
}

// Layout Component Props
export interface LayoutProps extends BaseComponentProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string[];
}

// Page Component Props
export interface PageProps extends BaseComponentProps {
  initialNews?: NewsItem[];
  isLoading?: boolean;
  onNewsUpdate?: (news: NewsItem) => void;
}

// Utility types for component state
export interface ComponentState {
  isLoading: boolean;
  error: string | null;
  data: any | null;
}

// Event handler types
export interface ComponentEventHandlers {
  onClick?: (event: React.MouseEvent) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (event: React.FormEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

// Style and theme types
export interface ComponentStyles {
  container?: React.CSSProperties;
  title?: React.CSSProperties;
  description?: React.CSSProperties;
  button?: React.CSSProperties;
  input?: React.CSSProperties;
}

// Component configuration types
export interface ComponentConfig {
  theme?: "light" | "dark" | "auto";
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
}
