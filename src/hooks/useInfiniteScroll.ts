import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  /** Callback function to execute when the bottom threshold is reached */
  onLoadMore: () => void;
  /** Distance from bottom (in pixels) to trigger load more */
  threshold?: number;
  /** Whether infinite scroll is enabled */
  enabled?: boolean;
  /** Whether there are more items to load */
  hasMore?: boolean;
  /** Whether data is currently loading */
  isLoading?: boolean;
}

/**
 * Hook to detect when user scrolls near the bottom of the page
 * and trigger a callback to load more content
 */
export const useInfiniteScroll = ({
  onLoadMore,
  threshold = 200,
  enabled = true,
  hasMore = true,
  isLoading = false,
}: UseInfiniteScrollOptions) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Don't set up observer if disabled, no more items, or already loading
    if (!enabled || !hasMore || isLoading) {
      // Clean up observer if it exists
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasLoadedRef.current) {
          setIsIntersecting(true);
          hasLoadedRef.current = true;
          onLoadMore();
          
          // Reset after a short delay to allow for new loads
          setTimeout(() => {
            hasLoadedRef.current = false;
            setIsIntersecting(false);
          }, 1000);
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: `${threshold}px`, // Trigger when sentinel is threshold pixels from bottom
        threshold: 0.1, // Trigger when 10% of sentinel is visible
      }
    );

    // Observe the sentinel element
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, isLoading, onLoadMore, threshold]);

  // Reset hasLoaded when hasMore changes
  useEffect(() => {
    if (!hasMore) {
      hasLoadedRef.current = false;
    }
  }, [hasMore]);

  return {
    sentinelRef,
    isIntersecting,
  };
};

