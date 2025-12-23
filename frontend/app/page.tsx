"use client";

import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import NewsList from "../components/NewsList";
import { searchNews, getLatestNews } from "../services/api";
import socket from "../services/socket";
import useDebounce from "../hooks/useDebounce";

export default function Home() {
  const [blendQuery, setBlendQuery] = useState("");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedBlendQuery = useDebounce(blendQuery, 300);

  // Initial load
  useEffect(() => {
    getLatestNews().then((data) => setNews(data.results));
  }, []);

  // 🔀 Instant blend
  useEffect(() => {
    const runBlend = async () => {
      if (!debouncedBlendQuery) {
        const data = await getLatestNews();
        setNews(data.results);
        return;
      }

      setLoading(true);
      const data = await searchNews(debouncedBlendQuery);
      setNews(data.results);
      setLoading(false);
    };

    runBlend();
  }, [debouncedBlendQuery]);

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
      <h1>📰 AI News Blend</h1>

      <SearchBar onBlend={setBlendQuery} />

      {loading && <div className="search-loading">🔀 Blending news with "{blendQuery}"...</div>}

      <NewsList news={news} />
    </main>
  );
}
