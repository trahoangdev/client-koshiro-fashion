import { useState, useEffect, useCallback } from 'react';
import { logger } from '../lib/logger';

interface UseAsyncDataOptions<T> {
  dependencies?: unknown[];
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  enabled?: boolean;
  immediate?: boolean;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for handling async data fetching with loading and error states
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useAsyncData({
 *   fetchFn: () => api.getProducts(),
 *   dependencies: [],
 *   enabled: true
 * });
 * ```
 */
export function useAsyncData<T>(
  options: UseAsyncDataOptions<T> & { fetchFn: () => Promise<T> }
): UseAsyncDataReturn<T> {
  const {
    fetchFn,
    dependencies = [],
    onSuccess,
    onError,
    enabled = true,
    immediate = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchFn();
      
      setData(result);
      onSuccess?.(result);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Error fetching data', err);
      setError(error);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, fetchFn, onSuccess, onError]);

  useEffect(() => {
    if (immediate && enabled) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, enabled, fetchData, ...dependencies]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}

