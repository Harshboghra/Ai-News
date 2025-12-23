import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SearchBox({ onBlend }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([]);
        onBlend(""); // 🔥 BLEND TRIGGER CLEAR
        return;
      }

      const res = await fetch(`${API}/api/news/suggest?q=${query}`);
      const data = await res.json();
      setSuggestions(data);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  function handleClick(value) {
    setQuery();
    setSuggestions([]);
    onBlend(value);
  }

  return (
    <div className="search-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}>
          BLEND MODE
        </span>
        <div
          style={{
            display: "inline-block",
            width: "8px",
            height: "8px",
            backgroundColor: "#2563eb",
            borderRadius: "50%",
            boxShadow: "0 0 8px #2563eb",
          }}
        ></div>
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
    </div>
  );
}
