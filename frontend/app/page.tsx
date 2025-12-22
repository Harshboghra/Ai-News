"use client";

import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import NewsList from "../components/NewsList";
import { searchNews, getLatestNews } from "../services/api";
import socket from "../services/socket";

export default function Home() {
  const [news, setNews] = useState([]);
  const [query, setQuery] = useState("");

  // Initial load
  useEffect(() => {
    getLatestNews().then((data) => setNews(data.results));
  }, []);

  // Search handler
  const handleSearch = async (value: any) => {
    setQuery(value);

    if (!value) {
      const data = await getLatestNews();
      setNews(data.results);
      return;
    }

    const data = await searchNews(value);
    setNews(data.results);
  };

  // Live updates
  useEffect(() => {
    socket.on("news:new", (newNews) => {
      setNews((prev) => [newNews, ...prev] as any);
    });

    return () => {
      socket.off("news:new");
    };
  }, []);

  return (
    <main className="container">
      <h1>📰 AI News Search</h1>

      <SearchBar onSearch={handleSearch} />

      <NewsList news={news} />
    </main>
  );
}
