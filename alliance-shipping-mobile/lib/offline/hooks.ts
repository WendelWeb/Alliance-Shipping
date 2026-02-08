import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import {
  getLocalPackages,
  getLocalPackageRequests,
  getLocalAnnouncements,
  getLocalNotifications,
  getLocalFees,
  addPendingPackageRequest,
  isSQLiteAvailable,
} from './database';
import {
  syncPackages,
  syncAnnouncements,
  syncNotifications,
  syncFees,
  fullSync,
  isOnline,
  getLastSyncTime,
} from './sync';

interface UseOfflineResult<T> {
  data: T;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isOffline: boolean;
  lastSync: string | null;
  refresh: () => Promise<void>;
}

/** Hook for offline-first packages */
export function useOfflinePackages(): UseOfflineResult<{ packages: any[]; requests: any[] }> {
  const { isSignedIn } = useAuth();
  const [data, setData] = useState<{ packages: any[]; requests: any[] }>({ packages: [], requests: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const loadLocal = useCallback(async () => {
    if (!isSQLiteAvailable()) return;
    try {
      const [packages, requests] = await Promise.all([
        getLocalPackages(),
        getLocalPackageRequests(),
      ]);
      setData({ packages, requests });
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    if (!isSignedIn) return;
    setRefreshing(true);
    setError(null);

    const online = await isOnline();
    setOffline(!online);

    if (online && isSQLiteAvailable()) {
      const success = await syncPackages();
      if (!success) {
        setError('Could not refresh from server');
      }
    }

    await loadLocal();
    if (isSQLiteAvailable()) {
      const sync = await getLastSyncTime();
      setLastSync(sync);
    }
    setRefreshing(false);
  }, [isSignedIn, loadLocal]);

  // Initial load: local first, then sync
  useEffect(() => {
    if (!isSignedIn || !isSQLiteAvailable()) {
      setLoading(false);
      return;
    }
    (async () => {
      await loadLocal();
      setLoading(false);
      // Then sync in background
      const online = await isOnline();
      setOffline(!online);
      if (online) {
        await syncPackages();
        await loadLocal();
      }
      const sync = await getLastSyncTime();
      setLastSync(sync);
    })();
  }, [isSignedIn, loadLocal]);

  return { data, loading, refreshing, error, isOffline: offline, lastSync, refresh };
}

/** Hook for offline-first announcements */
export function useOfflineAnnouncements(locale: string = 'en'): UseOfflineResult<any[]> {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const loadLocal = useCallback(async () => {
    if (!isSQLiteAvailable()) return;
    try {
      const announcements = await getLocalAnnouncements();
      setData(announcements);
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    const online = await isOnline();
    setOffline(!online);

    if (online && isSQLiteAvailable()) {
      const success = await syncAnnouncements(locale);
      if (!success) setError('Could not refresh');
    }

    await loadLocal();
    if (isSQLiteAvailable()) {
      const sync = await getLastSyncTime();
      setLastSync(sync);
    }
    setRefreshing(false);
  }, [locale, loadLocal]);

  useEffect(() => {
    if (!isSQLiteAvailable()) {
      setLoading(false);
      return;
    }
    (async () => {
      await loadLocal();
      setLoading(false);
      const online = await isOnline();
      setOffline(!online);
      if (online) {
        await syncAnnouncements(locale);
        await loadLocal();
      }
      const sync = await getLastSyncTime();
      setLastSync(sync);
    })();
  }, [locale, loadLocal]);

  return { data, loading, refreshing, error, isOffline: offline, lastSync, refresh };
}

/** Hook for offline-first notifications */
export function useOfflineNotifications(): UseOfflineResult<any[]> {
  const { isSignedIn } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const loadLocal = useCallback(async () => {
    if (!isSQLiteAvailable()) return;
    try {
      const notifications = await getLocalNotifications();
      setData(notifications);
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    if (!isSignedIn) return;
    setRefreshing(true);
    const online = await isOnline();
    setOffline(!online);
    if (online && isSQLiteAvailable()) await syncNotifications();
    await loadLocal();
    if (isSQLiteAvailable()) {
      const sync = await getLastSyncTime();
      setLastSync(sync);
    }
    setRefreshing(false);
  }, [isSignedIn, loadLocal]);

  useEffect(() => {
    if (!isSignedIn || !isSQLiteAvailable()) { setLoading(false); return; }
    (async () => {
      await loadLocal();
      setLoading(false);
      const online = await isOnline();
      setOffline(!online);
      if (online) {
        await syncNotifications();
        await loadLocal();
      }
      const sync = await getLastSyncTime();
      setLastSync(sync);
    })();
  }, [isSignedIn, loadLocal]);

  return { data, loading, refreshing, error, isOffline: offline, lastSync, refresh };
}

/** Hook for offline-first fees (used by calculator) */
export function useOfflineFees(): UseOfflineResult<any[]> {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const loadLocal = useCallback(async () => {
    if (!isSQLiteAvailable()) return;
    try {
      const fees = await getLocalFees();
      setData(fees);
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const online = await isOnline();
    setOffline(!online);
    if (online && isSQLiteAvailable()) await syncFees();
    await loadLocal();
    if (isSQLiteAvailable()) {
      const sync = await getLastSyncTime();
      setLastSync(sync);
    }
    setRefreshing(false);
  }, [loadLocal]);

  useEffect(() => {
    if (!isSQLiteAvailable()) {
      setLoading(false);
      return;
    }
    (async () => {
      await loadLocal();
      setLoading(false);
      const online = await isOnline();
      setOffline(!online);
      if (online) {
        await syncFees();
        await loadLocal();
      }
      const sync = await getLastSyncTime();
      setLastSync(sync);
    })();
  }, [loadLocal]);

  return { data, loading, refreshing, error, isOffline: offline, lastSync, refresh };
}

/** Submit a package request (works offline - queues for later sync) */
export async function submitPackageRequestOffline(data: any): Promise<boolean> {
  const online = await isOnline();

  if (online) {
    try {
      await (await import('@/lib/api')).api.post('/api/package-requests', data);
      return true;
    } catch {
      // Fall through to offline queue
    }
  }

  // Queue for later sync (only if SQLite available)
  if (isSQLiteAvailable()) {
    await addPendingPackageRequest(data);
  }
  return true;
}

/** Background sync hook - runs sync when app becomes active */
export function useBackgroundSync(locale: string = 'en') {
  const { isSignedIn } = useAuth();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!isSignedIn || !isSQLiteAvailable()) return;

    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        // Trigger background sync when app comes to foreground
        await fullSync(locale);
      }
      appState.current = nextState;
    });

    // Initial sync
    fullSync(locale).catch(() => {});

    return () => subscription.remove();
  }, [isSignedIn, locale]);
}
