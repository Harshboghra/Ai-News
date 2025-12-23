import React from 'react';
import { NewsCardProps } from '../types/components';

export default function NewsCard({ news, isNew = false, onClick }: NewsCardProps) {
  const publishedDate = new Date(news.publishedAt);
  const formattedDate = publishedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleClick = () => {
    if (onClick) {
      onClick(news);
    }
  };

  return (
    <div className={`card ${isNew ? 'new-item' : ''}`} onClick={handleClick}>
      <h3 className="card-title">{news.title}</h3>
      <p className="card-description">{news.description}</p>
      
      <div className="card-meta">
        <span className="source-badge">{news.source}</span>
        <span>{formattedDate}</span>
      </div>

      <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer" className="card-link">
        Read more <span className="card-arrow">→</span>
      </a>
    </div>
  );
}
