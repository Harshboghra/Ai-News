/**
 * Type Testing and Validation
 * Comprehensive type testing for all TypeScript definitions
 */

import {
  NewsItem,
  SearchResponse,
  LatestResponse,
  SuggestionsResponse,
  TrendingResponse,
  CategoryResponse,
  SourceResponse,
  DateRangeResponse,
  APIResponse,
  NewsAPIResponse,
  isNewsItem,
  isSearchResponse,
  isLatestResponse,
  isAPIResponse
} from './types';

import {
  NewsCardProps,
  NewsListProps,
  NewsSearchProps,
  SearchBarProps,
  LayoutProps,
  PageProps,
  BaseComponentProps
} from './types/components';

// Test data for validation
const mockNewsItem: NewsItem = {
  id: '1',
  _id: '1',
  title: 'Test News Title',
  description: 'Test news description',
  content: 'Full content of the news article',
  source: 'Test Source',
  sourceUrl: 'https://example.com/news/1',
  publishedAt: '2025-12-23T10:00:00Z',
  language: 'en',
  category: 'technology',
  tags: ['tech', 'news'],
  finalScore: 0.95
};

const mockSearchResponse: SearchResponse = {
  detectedLanguage: 'en',
  results: [mockNewsItem],
  strategy: 'success'
};

const mockLatestResponse: LatestResponse = {
  count: 1,
  results: [mockNewsItem]
};

const mockAPIResponse: APIResponse<NewsItem[]> = {
  success: true,
  data: [mockNewsItem],
  message: 'Success',
  code: 200
};

// Component prop tests
const mockNewsCardProps: NewsCardProps = {
  news: mockNewsItem,
  isNew: true,
  onClick: (news) => console.log('Clicked:', news.title)
};

const mockNewsListProps: NewsListProps = {
  news: [mockNewsItem],
  isLoading: false,
  onNewsClick: (news) => console.log('List clicked:', news.title),
  emptyStateMessage: 'No news available'
};

const mockNewsSearchProps: NewsSearchProps = {
  onSearch: (query) => console.log('Searching:', query),
  onSuggestions: (suggestions) => console.log('Suggestions:', suggestions),
  isLoading: false,
  placeholder: 'Search news...'
};

const mockSearchBarProps: SearchBarProps = {
  onBlend: (query) => console.log('Blending:', query),
  onSearch: (query) => console.log('Searching:', query),
  placeholder: 'Search...',
  blendPlaceholder: 'Blend news...',
  searchPlaceholder: 'Search news...'
};

const mockLayoutProps: LayoutProps = {
  children: 'Test content',
  title: 'Test Layout',
  description: 'Test layout description',
  keywords: ['test', 'layout']
};

const mockPageProps: PageProps = {
  initialNews: [mockNewsItem],
  isLoading: false,
  onNewsUpdate: (news) => console.log('News updated:', news.title)
};

// Type validation tests
function testTypeValidation() {
  console.log('🧪 Testing Type Validation...');

  // Test NewsItem validation
  console.log('✅ NewsItem validation:', isNewsItem(mockNewsItem));
  console.log('❌ Invalid NewsItem:', isNewsItem({ title: 'Test' }));

  // Test SearchResponse validation
  console.log('✅ SearchResponse validation:', isSearchResponse(mockSearchResponse));
  console.log('❌ Invalid SearchResponse:', isSearchResponse({ results: [] }));

  // Test LatestResponse validation
  console.log('✅ LatestResponse validation:', isLatestResponse(mockLatestResponse));
  console.log('❌ Invalid LatestResponse:', isLatestResponse({ results: [] }));

  // Test APIResponse validation
  console.log('✅ APIResponse validation:', isAPIResponse(mockAPIResponse));
  console.log('❌ Invalid APIResponse:', isAPIResponse({ data: [] }));

  console.log('🎉 Type validation tests completed!');
}

// Runtime type checking
function validateNewsItemRuntime(news: any): news is NewsItem {
  return isNewsItem(news);
}

function validateSearchResponseRuntime(response: any): response is SearchResponse {
  return isSearchResponse(response);
}

function validateLatestResponseRuntime(response: any): response is LatestResponse {
  return isLatestResponse(response);
}

function validateAPIResponseRuntime<T>(response: any): response is APIResponse<T> {
  return isAPIResponse(response);
}

// Type utility tests
function testTypeUtilities() {
  console.log('🧪 Testing Type Utilities...');

  // Test type guards with runtime data
  const testData = {
    title: 'Test',
    description: 'Test description',
    source: 'Test Source',
    publishedAt: '2025-12-23T10:00:00Z'
  };

  console.log('✅ Runtime NewsItem validation:', validateNewsItemRuntime(testData));
  console.log('✅ Runtime APIResponse validation:', validateAPIResponseRuntime(mockAPIResponse));

  console.log('🎉 Type utility tests completed!');
}

// Component prop validation
function validateComponentProps() {
  console.log('🧪 Testing Component Props...');

  // Test component props are properly typed
  const newsCardProps: NewsCardProps = {
    news: mockNewsItem,
    isNew: true
  };

  const newsListProps: NewsListProps = {
    news: [mockNewsItem],
    isLoading: false
  };

  console.log('✅ NewsCardProps validation:', !!newsCardProps.news);
  console.log('✅ NewsListProps validation:', !!newsListProps.news);

  console.log('🎉 Component props tests completed!');
}

// Export test functions
export {
  testTypeValidation,
  testTypeUtilities,
  validateComponentProps,
  validateNewsItemRuntime,
  validateSearchResponseRuntime,
  validateLatestResponseRuntime,
  validateAPIResponseRuntime
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  testTypeValidation();
  testTypeUtilities();
  validateComponentProps();
}
