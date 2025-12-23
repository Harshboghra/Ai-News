"use client";

import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import NewsList from "../components/NewsList";
import { newsService } from "../services/news.service";
import { socketService } from "../services/socket.service";
import useDebounce from "../hooks/useDebounce";
import { NewsItem } from "../types";
import CategoryFilter from "../components/CategoryFilter";
import Pagination from "../components/Pagination";
import { NewsCategory, CategoryNewsResponse } from "../types/category";

export default function Home() {
  const [blendQuery, setBlendQuery] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  // Initial load and category/news updates
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        if (selectedCategory) {
          // Load category-specific news with pagination
          console.log('Loading category news:', {
            category: selectedCategory,
            page: currentPage,
            limit: 20
          });

          const response = await newsService.getByCategory(selectedCategory, { 
            limit: 20, 
            language: 'en',
            page: currentPage
          });
          
          console.log('Category response:', response);
          
          // Handle different response formats
          if (response && typeof response === 'object') {
            let newsData = [];
            let totalNews = 0;
            
            if ('data' in response && response.data && 'news' in response.data) {
              // New format: { success: true, data: { news: [...], pagination: {...} } }
              newsData = response.data.news || [];
              if (response.data.pagination) {
                totalNews = response.data.pagination.total || 0;
              }
            } else if ('news' in response) {
              // Direct format: { news: [...], pagination: {...} }
              newsData = response.news || [];
              if (response.pagination) {
                totalNews = response.pagination.total || 0;
              }
            } else {
              // Fallback to any format
              newsData = response.news || response.results || [];
              totalNews = newsData.length;
            }
            
            console.log('Setting news data:', {
              newsDataLength: newsData.length,
              totalNews,
              currentPage,
              totalPages: Math.ceil(totalNews / 20)
            });
            
            setNews(newsData);
            setTotalPages(Math.ceil(totalNews / 20)); // Assuming 20 items per page
          } else {
            console.log('No response data, setting empty news');
            setNews([]);
            setTotalPages(1);
          }
        } else {
          // Load general news (no pagination for general news)
          const response = await newsService.getLatestNews({ limit: 20, language: 'en' });
          
          if (response && typeof response === 'object') {
            if ('data' in response && response.data) {
              setNews(response.data.results || []);
            } else {
              setNews(response.results || []);
            }
          } else {
            setNews([]);
          }
          setTotalPages(1); // No pagination for general news
        }
      } catch (error) {
        console.error('Failed to load news:', error);
        setNews([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [selectedCategory, currentPage]);

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

  // 🔴 Live updates with category filtering
  useEffect(() => {
    const handleNewsUpdate = (item: NewsItem) => {
      // Only add news if it matches the selected category or no category is selected
      if (!selectedCategory || item.category === selectedCategory) {
        setNews((prev) => [item, ...prev]);
      }
    };

    socketService.onNewsUpdate(handleNewsUpdate);

    return () => {
      socketService.off('news:new', handleNewsUpdate);
    };
  }, [selectedCategory]);

  return (
    <main className="container">
      <h1>📰 AI News Blend</h1>

      <SearchBar onBlend={setBlendQuery} />

      {loading && <div className="search-loading">🔀 Blending news with "{blendQuery}"...</div>}

      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={(category) => {
          console.log('Category changed:', { oldCategory: selectedCategory, newCategory: category });
          setSelectedCategory(category);
          setCurrentPage(1); // Reset to first page when category changes
        }}
      />

      <NewsList news={news} />

      {selectedCategory && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            console.log('Page change requested:', { currentPage, newPage: page });
            setCurrentPage(page);
          }}
          className="news-pagination"
        />
      )}
    </main>
  );
}
