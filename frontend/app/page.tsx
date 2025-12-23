"use client";

import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import NewsList from "../components/NewsList";
import { searchNews, getLatestNews } from "../services/api";
import socket from "../services/socket";
import useDebounce from "../hooks/useDebounce";

export default function Home() {
  const [query, setQuery] = useState("");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Initial load
  useEffect(() => {
    getLatestNews().then((data) => setNews(data.results));
  }, []);

  // 🔍 Instant search
  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedQuery) {
        const data = await getLatestNews();
        setNews(data.results);
        return;
      }

      setLoading(true);
      const data = await searchNews(debouncedQuery);
      setNews(data.results);
      setLoading(false);
    };

    runSearch();
  }, [debouncedQuery]);

  // 🔴 Live updates
  useEffect(() => {
    socket.on("news:new", (item) => {
      setNews((prev) => [item, ...prev] as typeof prev);
    });

    return () => {
      socket.off("news:new");
    };
  }, []);

  return (
    <main className="container">
      <h1>📰 AI News Search</h1>

      <SearchBar value={query} onChange={setQuery} />

      {loading && <p>Searching...</p>}

      <NewsList news={news} />
    </main>
  );
}
