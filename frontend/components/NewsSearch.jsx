import { useState } from "react";
import SearchBar from "./SearchBar";
import { newsService } from "../services/news.service";

export default function NewsSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(value) {
    if (!value || value.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await newsService.searchNews(value.trim(), { 
        limit: 20, 
        language: 'en' 
      });
      
      setResults(data?.results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="news-search-container">
      <SearchBar onBlend={handleSearch} />

      {loading && (
        <div className="search-loading">
          🔍 Searching for "{results.length > 0 ? 'results' : '...'}"...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="news-results">
        {results.map((item) => (
          <div key={item._id || item.id} className="card">
            <h3 className="card-title">{item.title}</h3>
            <div className="card-meta">
              <span className="source-badge">{item.source}</span>
              <span>
                {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Unknown date'}
              </span>
            </div>
            {item.description && (
              <p className="card-description">{item.description}</p>
            )}
            {item.sourceUrl && (
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="card-link">
                Read more <span className="card-arrow">→</span>
              </a>
            )}
          </div>
        ))}
        
        {results.length === 0 && !loading && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">📰</div>
            <p>Start searching to find news articles</p>
          </div>
        )}
      </div>
    </div>
  );
}
