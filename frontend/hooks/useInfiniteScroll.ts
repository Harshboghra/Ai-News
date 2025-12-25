import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
}

interface UseInfiniteScrollReturn {
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  setIsLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  observerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Custom hook for implementing infinite scroll functionality
 * @param loadMoreCallback - Function to load more data
 * @param options - Configuration options
 * @returns Infinite scroll state and controls
 */
export function useInfiniteScroll(
  loadMoreCallback: () => Promise<void | boolean>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 0.1, // Trigger when 10% from bottom (90% scrolled)
    rootMargin = '200px',
    disabled = false
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Reset state when component mounts or dependencies change
  const reset = useCallback(() => {
    setIsLoading(false);
    setHasMore(true);
    isInitialLoad.current = true;
  }, []);

  // Load more data with error handling
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || disabled) return;

    try {
      setIsLoading(true);
      const result = await loadMoreCallback();
      isInitialLoad.current = false;

      // If the callback returns a boolean, use it to update hasMore
      if (typeof result === 'boolean') {
        setHasMore(result);
      }
    } catch (error) {
      console.error('Failed to load more data:', error);
      setHasMore(false); // Set hasMore to false on error
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, disabled, loadMoreCallback]);

  // Setup intersection observer
  useEffect(() => {
    if (disabled || !targetRef.current) {
      return;
    }

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading && hasMore) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [isLoading, hasMore, disabled, threshold, rootMargin, loadMore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    isLoading,
    hasMore,
    loadMore,
    reset,
    setIsLoading,
    setHasMore,
    observerRef: targetRef
  };
}
