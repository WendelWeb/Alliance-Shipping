'use client';

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
  type ReactNode,
} from 'react';

// ── Types ──────────────────────────────────────────────────────────────

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

interface AdminCacheContextValue {
  get: <T>(key: string) => T | undefined;
  set: <T>(key: string, data: T) => void;
  invalidate: (key: string) => void;
  invalidateAll: () => void;
}

const AdminCacheContext = createContext<AdminCacheContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────

export function AdminCacheProvider({ children }: { children: ReactNode }) {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  const get = useCallback(<T,>(key: string): T | undefined => {
    const entry = cacheRef.current.get(key);
    if (!entry) return undefined;
    return entry.data as T;
  }, []);

  const set = useCallback(<T,>(key: string, data: T): void => {
    cacheRef.current.set(key, { data, timestamp: Date.now() });
  }, []);

  const invalidate = useCallback((key: string): void => {
    cacheRef.current.delete(key);
  }, []);

  const invalidateAll = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  return (
    <AdminCacheContext.Provider value={{ get, set, invalidate, invalidateAll }}>
      {children}
    </AdminCacheContext.Provider>
  );
}

// ── Raw cache access ──────────────────────────────────────────────────

/** Direct access to the admin cache (get/set/invalidate). */
export function useAdminCache() {
  const cache = useContext(AdminCacheContext);
  if (!cache) throw new Error('useAdminCache must be used inside <AdminCacheProvider>');
  return cache;
}

// ── Hook ───────────────────────────────────────────────────────────────

interface UseCachedFetchOptions {
  /** Don't fetch automatically on mount */
  manual?: boolean;
}

interface UseCachedFetchReturn<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  refresh: () => void;
}

/**
 * Fetch data with admin-level caching.
 *
 * - First visit  → shows loading, fetches, caches.
 * - Revisit      → returns cached data instantly (no loading).
 * - `refresh()`  → re-fetches in the background (no loading flash,
 *                   `refreshing` flag set for UI spinners).
 */
export function useCachedFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options?: UseCachedFetchOptions,
): UseCachedFetchReturn<T> {
  const cache = useContext(AdminCacheContext);
  if (!cache) throw new Error('useCachedFetch must be used inside <AdminCacheProvider>');

  const cached = cache.get<T>(cacheKey);

  const [data, setData] = useState<T | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached && !options?.manual);
  const [refreshing, setRefreshing] = useState(false);

  // Track if we've started the initial fetch to avoid double-fetching in StrictMode
  const fetchedRef = useRef(false);

  // Run initial fetch (only once)
  if (!fetchedRef.current && !cached && !options?.manual) {
    fetchedRef.current = true;
    fetchFn()
      .then((result) => {
        cache.set(cacheKey, result);
        setData(result);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  } else if (!fetchedRef.current && cached) {
    fetchedRef.current = true;
  }

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchFn()
      .then((result) => {
        cache.set(cacheKey, result);
        setData(result);
      })
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }, [cacheKey, fetchFn, cache]);

  return { data, loading, refreshing, refresh };
}
