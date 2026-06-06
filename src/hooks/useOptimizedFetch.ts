"use client";

import { useState, useEffect, useCallback } from "react";

interface UseOptimizedFetchOptions {
  showLoading?: boolean;
  loadingMessage?: string;
  cacheTime?: number; // in milliseconds
  retryCount?: number;
  retryDelay?: number;
}

interface UseOptimizedFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

const cache = new Map<string, { data: any; timestamp: number }>();

export function useOptimizedFetch<T>(
  url: string,
  options: UseOptimizedFetchOptions = {}
): UseOptimizedFetchReturn<T> {
  const {
    showLoading = false,
    loadingMessage = "Loading data...",
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    retryCount = 2,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (attempt = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = cache.get(url);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Cache the result
      cache.set(url, { data: result, timestamp: Date.now() });

      setData(result);
    } catch (err) {
      console.error(`Fetch error (attempt ${attempt + 1}):`, err);

      if (attempt < retryCount) {
        setTimeout(() => fetchData(attempt + 1), retryDelay * (attempt + 1));
        return;
      }

      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, cacheTime, retryCount, retryDelay]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    // Clear cache for this URL
    cache.delete(url);
    await fetchData();
  }, [url, fetchData]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
    // Update cache
    cache.set(url, { data: newData, timestamp: Date.now() });
  }, [url]);

  return { data, loading, error, refetch, mutate };
}

export function useOptimizedParallelFetch<T>(
  urls: string[],
  options: UseOptimizedFetchOptions = {}
): UseOptimizedFetchReturn<T[]> {
  const {
    showLoading = false,
    loadingMessage = "Loading data...",
    retryCount = 2,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async (attempt = 0) => {
    try {
      setLoading(true);
      setError(null);

      const promises = urls.map(url =>
        fetch(url, {
          credentials: 'include'
        }).then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
      );

      const results = await Promise.all(promises);
      setData(results);
    } catch (err) {
      console.error(`Parallel fetch error (attempt ${attempt + 1}):`, err);

      if (attempt < retryCount) {
        setTimeout(() => fetchAllData(attempt + 1), retryDelay * (attempt + 1));
        return;
      }

      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [urls, retryCount, retryDelay]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refetch = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  const mutate = useCallback((newData: T[]) => {
    setData(newData);
  }, []);

  return { data, loading, error, refetch, mutate };
}
