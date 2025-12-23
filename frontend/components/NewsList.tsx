import React from 'react';
import NewsCard from './NewsCard';
import { NewsListProps } from '../types/components';

export default function NewsList({ news, isLoading, onNewsClick, emptyStateMessage = "No news found" }: NewsListProps) {
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
    </div>
  );
}
