import React from 'react';
import NewsCard from './NewsCard';
import { NewsListProps } from '../types/components';

export default function NewsList({ 
  news, 
  isLoading, 
  isLoadingMore, 
  hasMore, 
  onNewsClick, 
  emptyStateMessage = "No news found",
  onLoadMoreRef,
  onRetryLoadMore
}: NewsListProps) {
  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner">📰</div>
        <p>Loading news...</p>
      </div>
    );
  }

  if (!news?.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📰</div>
        <p>{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {news.map((item, index) => (
        <NewsCard 
          key={item._id} 
          news={item} 
          isNew={index === 0}
          onClick={onNewsClick}
        />
      ))}
      
      {/* Infinite scroll loading indicator */}
      {isLoadingMore && (
        <div className="infinite-scroll-loading">
          <div className="loading-spinner">📰</div>
          <p>Loading more news...</p>
        </div>
      )}
      
      {/* Intersection observer target for infinite scroll */}
      {hasMore && (
        <div ref={onLoadMoreRef as any} className="infinite-scroll-target" />
      )}
      
      {/* No more content indicator */}
      {!hasMore && news.length > 0 && (
        <div className="infinite-scroll-end">
          <p>🎉 You've reached the end of the news!</p>
        </div>
      )}
    </div>
  );
}
