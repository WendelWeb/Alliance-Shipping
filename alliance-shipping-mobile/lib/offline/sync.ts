let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  console.warn('@react-native-community/netinfo not available. Assuming online.');
}

import { api } from '@/lib/api';
import {
  upsertPackages,
  upsertPackageRequests,
  upsertAnnouncements,
  upsertNotifications,
  upsertFees,
  getPendingRequests,
  removePendingRequest,
  clearPendingSyncFlags,
  setSyncMeta,
  getSyncMeta,
  isSQLiteAvailable,
} from './database';

/** Check if device has internet connectivity */
export async function isOnline(): Promise<boolean> {
  if (!NetInfo) return true;
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  } catch {
    return true;
  }
}

/** Push any queued offline requests to the server */
async function pushPendingRequests(): Promise<number> {
  if (!isSQLiteAvailable()) return 0;
  const pending = await getPendingRequests();
  let synced = 0;

  for (const req of pending) {
    try {
      const body = req.body ? JSON.parse(req.body) : undefined;
      if (req.method === 'POST') {
        await api.post(req.endpoint, body);
      } else if (req.method === 'PATCH') {
        await api.patch(req.endpoint, body);
      }
      await removePendingRequest(req.id);
      synced++;
    } catch (error) {
      // If the request fails, leave it in queue and continue with others
      console.warn('Sync push failed for request:', req.id, error);
    }
  }

  if (synced > 0) {
    await clearPendingSyncFlags();
  }
  return synced;
}

/** Pull fresh data from server for packages and requests */
export async function syncPackages(): Promise<boolean> {
  if (!isSQLiteAvailable()) return false;
  try {
    const data = await api.get<{ packages: any[]; requests: any[] }>('/api/user/packages');
    if (data.packages) {
      await upsertPackages(data.packages);
    }
    if (data.requests) {
      await upsertPackageRequests(data.requests);
    }
    await setSyncMeta('packages_last_sync', new Date().toISOString());
    return true;
  } catch (error) {
    console.warn('Package sync failed:', error);
    return false;
  }
}

/** Pull fresh announcements */
export async function syncAnnouncements(locale: string = 'en'): Promise<boolean> {
  if (!isSQLiteAvailable()) return false;
  try {
    const data = await api.get<{ announcements: any[] }>(`/api/announcements/public?lang=${locale}&limit=50`);
    if (data.announcements) {
      await upsertAnnouncements(data.announcements);
    }
    await setSyncMeta('announcements_last_sync', new Date().toISOString());
    return true;
  } catch (error) {
    console.warn('Announcements sync failed:', error);
    return false;
  }
}

/** Pull fresh notifications */
export async function syncNotifications(): Promise<boolean> {
  if (!isSQLiteAvailable()) return false;
  try {
    const data = await api.get<{ notifications: any[] }>('/api/user/notifications?limit=50');
    if (data.notifications) {
      await upsertNotifications(data.notifications);
    }
    await setSyncMeta('notifications_last_sync', new Date().toISOString());
    return true;
  } catch (error) {
    console.warn('Notifications sync failed:', error);
    return false;
  }
}

/** Pull fresh fee/pricing data (public endpoint) */
export async function syncFees(): Promise<boolean> {
  if (!isSQLiteAvailable()) return false;
  try {
    const data = await api.get<{ cities: any[] }>('/api/pricing/all');
    if (data.cities && data.cities.length > 0) {
      // Store city pricing as JSON in sync_meta for offline calculator
      await setSyncMeta('cached_city_pricing', JSON.stringify(data.cities));
    }
    await setSyncMeta('fees_last_sync', new Date().toISOString());
    return true;
  } catch (error) {
    console.warn('Fees sync failed:', error);
    return false;
  }
}

/** Full sync: push pending changes, then pull all data */
export async function fullSync(locale: string = 'en'): Promise<{
  online: boolean;
  pushed: number;
  pulled: { packages: boolean; announcements: boolean; notifications: boolean; fees: boolean };
}> {
  const online = await isOnline();

  if (!online || !isSQLiteAvailable()) {
    return {
      online,
      pushed: 0,
      pulled: { packages: false, announcements: false, notifications: false, fees: false },
    };
  }

  // Push first, then pull
  const pushed = await pushPendingRequests();

  // Pull all data in parallel
  const [packages, announcements, notifications, fees] = await Promise.all([
    syncPackages(),
    syncAnnouncements(locale),
    syncNotifications(),
    syncFees(),
  ]);

  await setSyncMeta('last_full_sync', new Date().toISOString());

  return {
    online: true,
    pushed,
    pulled: { packages, announcements, notifications, fees },
  };
}

/** Get the time of last successful sync */
export async function getLastSyncTime(): Promise<string | null> {
  if (!isSQLiteAvailable()) return null;
  return getSyncMeta('last_full_sync');
}
