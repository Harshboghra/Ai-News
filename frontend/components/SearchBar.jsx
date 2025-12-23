import { useState, useEffect } from "react";
import { newsService } from "../services/news.service";

export default function SearchBar({ onBlend }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const data = await newsService.getSuggestions(query, { 
          limit: 8, 
          language: 'en' 
        });
        setSuggestions(data || []);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  function handleClick(value) {
    setQuery(value);
    setSuggestions([]);
    onBlend(value);
  }

  return (
    <div className="search-container">
      <div className="blend-mode-container">
        <span className="blend-mode-label">BLEND MODE</span>
        <div className="blend-mode-dot"></div>
      </div>

      <input
        className="search-input"
        placeholder="Blend news with topics, keywords, or themes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onBlend(query);
            setSuggestions([]);
          }
        }}
      />

      {suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((item, i) => {
            const value = item.query || item.title;
            return (
              <div
                key={i}
                onClick={() => handleClick(value)}
                className="suggestion-item"
              >
                <span className="suggestion-icon">🔀</span>
                <span className="suggestion-text">{value}</span>
              </div>
            );
          })}
        </div>
      )}

      {loading && suggestions.length === 0 && (
        <div className="suggestions-dropdown">
          <div className="suggestion-item">
            <span className="suggestion-icon">⏳</span>
            <span className="suggestion-text">Loading suggestions...</span>
          </div>
        </div>
      )}
    </div>
  );
}
