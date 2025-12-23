"use client";

import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import NewsList from "../components/NewsList";
import { newsService } from "../services/news.service";
import { socketService } from "../services/socket.service";
import useDebounce from "../hooks/useDebounce";
import { NewsItem } from "../types";

export default function Home() {
  const [blendQuery, setBlendQuery] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedBlendQuery = useDebounce(blendQuery, 300);

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketService.connect();
        console.log('Socket connected successfully');
      } catch (error) {
        console.error('Failed to connect socket:', error);
      }
    };

    initializeSocket();
  }, []);

  // Initial load
  useEffect(() => {
    const loadLatestNews = async () => {
      try {
        const response = await newsService.getLatestNews({ limit: 20, language: 'en' });
        const data = response as any;
        setNews(data.results || []);
      } catch (error) {
        console.error('Failed to load latest news:', error);
        setNews([]);
      }
    };

    loadLatestNews();
  }, []);

  // 🔀 Instant blend
  useEffect(() => {
    const runBlend = async () => {
      if (!debouncedBlendQuery) {
        const response = await newsService.getLatestNews({ limit: 20, language: 'en' });
        const data = response as any;
        setNews(data.results || []);
        return;
      }

      setLoading(true);
      try {
        const response = await newsService.searchNews(debouncedBlendQuery, { limit: 50, language: 'en' });
        const data = response as any;
        setNews(data.results || []);
      } catch (error) {
        console.error('Search failed:', error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    runBlend();
  }, [debouncedBlendQuery]);

  // 🔴 Live updates
  useEffect(() => {
    const handleNewsUpdate = (item: NewsItem) => {
      setNews((prev) => [item, ...prev]);
    };

    socketService.onNewsUpdate(handleNewsUpdate);

    return () => {
      socketService.off('news:new', handleNewsUpdate);
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
