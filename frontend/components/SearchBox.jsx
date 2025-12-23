import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SearchBox({ onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const url =
        query.length < 2
          ? `${API}/api/news/trending`
          : `${API}/api/news/suggest?q=${query}`;

      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  function handleClick(value) {
    setQuery(value);
    setSuggestions([]);
    onSearch(value); // 🔥 FILTER TRIGGER
  }

  return (
    <div className="relative">
      <input
        className="w-full border p-2"
        placeholder="Search news..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch(query);
            setSuggestions([]);
          }
        }}
      />

      {suggestions.length > 0 && (
        <div className="absolute bg-white border w-full z-10">
          {suggestions.map((item, i) => {
            const value = item.query || item.title;
            return (
              <div
                key={i}
                onClick={() => handleClick(value)}
                className="p-2 hover:bg-gray-100 cursor-pointer flex gap-2"
              >
                {item.query ? "🔥" : "🔍"}
                <span>{value}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
