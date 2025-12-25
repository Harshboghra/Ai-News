"use client";

import { useEffect, useState, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import NewsList from "../components/NewsList";
import { newsService } from "../services/news.service";
import { socketService } from "../services/socket.service";
import useDebounce from "../hooks/useDebounce";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { NewsItem } from "../types";
import CategoryFilter from "../components/CategoryFilter";
import { NewsCategory } from "../types/category";

export default function Home() {
  const [blendQuery, setBlendQuery] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedBlendQuery = useDebounce(blendQuery, 300);

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketService.connect();
        console.log("Socket connected successfully");
      } catch (error) {
        console.error("Failed to connect socket:", error);
      }
    };

    initializeSocket();
  }, []);

  // Helper function to extract news from API response
  const extractNewsFromResponse = useCallback((response: any): NewsItem[] => {
    if (!response || typeof response !== "object") return [];

    // Handle different response formats
    if (response.data && response.data.news) {
      return response.data.news;
    }
    if (response.data && response.data.results) {
      return response.data.results;
    }
    if (response.news) {
      return response.news;
    }
    if (response.results) {
      return response.results;
    }

    return [];
  }, []);

  // Helper function to check if more content is available
  const hasMoreContent = useCallback((response: any): boolean => {
    if (!response || typeof response !== "object") return false;

    // Check pagination data
    if (response.data?.pagination?.hasNext !== undefined) {
      return response.data.pagination.hasNext;
    }

    // Fallback: assume more content if we got exactly the limit (20 items)
    const newsData = extractNewsFromResponse(response);
    return newsData.length === 20;
  }, [extractNewsFromResponse]);

  // Load initial news data
  const loadInitialNews = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1);

    try {
      let response;

      if (selectedCategory) {
        response = await newsService.getByCategory(selectedCategory, {
          limit: 20,
          language: 'en',
          page: 1
        });
      } else if (debouncedBlendQuery) {
        response = await newsService.searchNews(debouncedBlendQuery, {
          limit: 20,
          language: 'en',
          page: 1
        });
      } else {
        response = await newsService.getLatestNews({
          limit: 20,
          language: 'en',
          page: 1
        });
      }

      const newsData = extractNewsFromResponse(response);
      const hasMore = hasMoreContent(response);

      setNews(newsData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to load news:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedBlendQuery, extractNewsFromResponse, hasMoreContent]);

  // Load more news for infinite scroll
  const loadMoreNews = useCallback(async () => {
    const nextPage = currentPage + 1;

    try {
      let response;

      if (selectedCategory) {
        response = await newsService.getByCategory(selectedCategory, {
          page: nextPage,
          limit: 20,
          language: "en",
        });
      } else if (debouncedBlendQuery) {
        response = await newsService.searchNews(debouncedBlendQuery, {
          page: nextPage,
          limit: 20,
          language: "en",
        });
      } else {
        response = await newsService.getLatestNews({
          page: nextPage,
          limit: 20,
          language: "en",
        });
      }

      const newNewsData = extractNewsFromResponse(response);
      const hasMore = hasMoreContent(response);

      // Append new news to existing news, avoiding duplicates
      setNews(prevNews => {
        const existingIds = new Set(prevNews.map(item => item._id));
        const uniqueNewNews = newNewsData.filter(item => !existingIds.has(item._id));
        return [...prevNews, ...uniqueNewNews];
      });

      setCurrentPage(nextPage);

      // Return whether more content is available
      return hasMore;
    } catch (error) {
      console.error("Load more failed:", error);
      return false; // No more content on error
    }
  }, [currentPage, selectedCategory, debouncedBlendQuery, extractNewsFromResponse, hasMoreContent]);

  // Setup infinite scroll hook
  const {
    isLoading: isLoadingMore,
    hasMore,
    observerRef,
  } = useInfiniteScroll(loadMoreNews, {
    threshold: 0.1, // Trigger at 90% scroll
    rootMargin: "200px",
    disabled: loading,
  });

  // Load initial news when category or search query changes
  useEffect(() => {
    loadInitialNews();
  }, [loadInitialNews]);

  // 🔴 Live updates with category filtering (insert at top)
  useEffect(() => {
    const handleNewsUpdate = (item: NewsItem) => {
      // Only add news if it matches the selected category or no category is selected
      if (!selectedCategory || item.category === selectedCategory) {
        setNews((prev) => {
          // Check if item already exists to avoid duplicates
          const exists = prev.some((existing) => existing._id === item._id);
          if (exists) return prev;
          return [item, ...prev];
        });
      }
    };

    socketService.onNewsUpdate(handleNewsUpdate);

    return () => {
      socketService.off("news:new", handleNewsUpdate);
    };
  }, [selectedCategory]);

  return (
    <main className="container">
      <h1>📰 AI News Blend</h1>

      <SearchBar onBlend={setBlendQuery} />

      {loading && !news.length && (
        <div className="search-loading">
          🔀 Blending news with "{blendQuery}"...
        </div>
      )}

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={(category) => {
          console.log("Category changed:", {
            oldCategory: selectedCategory,
            newCategory: category,
          });
          setSelectedCategory(category);
          // State will be reset by loadInitialNews
        }}
      />

      <NewsList
        news={news}
        isLoading={loading && !news.length}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMoreRef={observerRef}
      />
    </main>
  );
}
