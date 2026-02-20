let SQLite: typeof import('expo-sqlite') | null = null;

try {
  SQLite = require('expo-sqlite');
} catch {
  console.warn('expo-sqlite not available (Expo Go?). Offline mode disabled.');
}

let db: any = null;
let sqliteDisabled = false;

export async function getDatabase(): Promise<any> {
  if (!SQLite || sqliteDisabled) throw new Error('SQLite not available');
  if (db) return db;
  try {
    db = await SQLite.openDatabaseAsync('alliance-shipping.db');
    await initializeDatabase(db);
    return db;
  } catch (error) {
    console.warn('SQLite database initialization failed (Expo Go?). Disabling offline mode.');
    db = null;
    sqliteDisabled = true;
    throw new Error('SQLite database unavailable');
  }
}

export function isSQLiteAvailable(): boolean {
  return SQLite !== null && !sqliteDisabled;
}

async function initializeDatabase(database: any) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY,
      trackingNumber TEXT UNIQUE,
      externalTrackingNumber TEXT,
      description TEXT,
      weight REAL,
      category TEXT,
      status TEXT,
      currentLocation TEXT,
      recipientCity TEXT,
      recipientName TEXT,
      serviceFee REAL,
      weightCost REAL,
      totalCost REAL,
      createdAt TEXT,
      updatedAt TEXT,
      syncedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS package_timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      packageId INTEGER,
      status TEXT,
      location TEXT,
      description TEXT,
      timestamp TEXT,
      FOREIGN KEY (packageId) REFERENCES packages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS package_requests (
      id INTEGER PRIMARY KEY,
      externalTrackingNumber TEXT,
      description TEXT,
      category TEXT,
      customerNotes TEXT,
      recipientCity TEXT,
      status TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      syncedAt TEXT,
      pendingSync INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY,
      title TEXT,
      content TEXT,
      type TEXT,
      priority TEXT,
      imageUrl TEXT,
      isPinned INTEGER DEFAULT 0,
      createdAt TEXT,
      syncedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY,
      type TEXT,
      title TEXT,
      message TEXT,
      isRead INTEGER DEFAULT 0,
      packageId INTEGER,
      createdAt TEXT,
      syncedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY,
      feeType TEXT,
      amount REAL,
      currency TEXT DEFAULT 'USD',
      isActive INTEGER DEFAULT 1,
      syncedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS pending_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT,
      method TEXT,
      body TEXT,
      createdAt TEXT
    );
  `);
}

// ==================== PACKAGES ====================

export async function upsertPackages(packages: any[]) {
  const database = await getDatabase();
  const now = new Date().toISOString();

  for (const pkg of packages) {
    await database.runAsync(
      `INSERT OR REPLACE INTO packages
       (id, trackingNumber, externalTrackingNumber, description, weight, category, status,
        currentLocation, recipientCity, recipientName, serviceFee, weightCost, totalCost,
        createdAt, updatedAt, syncedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pkg.id, pkg.trackingNumber, pkg.externalTrackingNumber || null,
        pkg.description, pkg.weight, pkg.category, pkg.status,
        pkg.currentLocation || null, null, null, // ✅ recipientCity & recipientName removed (use user profile)
        pkg.serviceFee || null, pkg.weightCost || null, pkg.totalCost || null,
        pkg.createdAt, pkg.updatedAt || pkg.createdAt, now,
      ]
    );

    // Upsert timeline
    if (pkg.timeline && Array.isArray(pkg.timeline)) {
      await database.runAsync('DELETE FROM package_timeline WHERE packageId = ?', [pkg.id]);
      for (const event of pkg.timeline) {
        await database.runAsync(
          'INSERT INTO package_timeline (packageId, status, location, description, timestamp) VALUES (?, ?, ?, ?, ?)',
          [pkg.id, event.status, event.location || '', event.description || '', event.date || event.timestamp]
        );
      }
    }
  }
}

export async function getLocalPackages(): Promise<any[]> {
  const database = await getDatabase();
  const packages = await database.getAllAsync('SELECT * FROM packages ORDER BY createdAt DESC');

  // Attach timeline to each package
  for (const pkg of packages as any[]) {
    const timeline = await database.getAllAsync(
      'SELECT * FROM package_timeline WHERE packageId = ? ORDER BY timestamp ASC',
      [pkg.id]
    );
    pkg.timeline = timeline;
  }

  return packages as any[];
}

// ==================== PACKAGE REQUESTS ====================

export async function upsertPackageRequests(requests: any[]) {
  const database = await getDatabase();
  const now = new Date().toISOString();

  for (const req of requests) {
    await database.runAsync(
      `INSERT OR REPLACE INTO package_requests
       (id, externalTrackingNumber, description, category, customerNotes, recipientCity,
        status, createdAt, updatedAt, syncedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.id, req.externalTrackingNumber, req.description, req.category,
        req.customerNotes || null, null, req.status, // ✅ recipientCity removed (use user profile)
        req.createdAt, req.updatedAt || req.createdAt, now,
      ]
    );
  }
}

export async function getLocalPackageRequests(): Promise<any[]> {
  const database = await getDatabase();
  return database.getAllAsync('SELECT * FROM package_requests ORDER BY createdAt DESC') as any;
}

export async function addPendingPackageRequest(data: any) {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    `INSERT INTO package_requests
     (id, externalTrackingNumber, description, category, customerNotes, recipientCity,
      status, createdAt, updatedAt, pendingSync)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, 1)`,
    [
      -Date.now(), data.externalTrackingNumber, data.description, data.category,
      data.customerNotes || null, null, now, now, // ✅ recipientCity removed (use user profile)
    ]
  );

  // Queue for sync
  await database.runAsync(
    'INSERT INTO pending_requests (endpoint, method, body, createdAt) VALUES (?, ?, ?, ?)',
    ['/api/package-requests', 'POST', JSON.stringify(data), now]
  );
}

// ==================== ANNOUNCEMENTS ====================

export async function upsertAnnouncements(announcements: any[]) {
  const database = await getDatabase();
  const now = new Date().toISOString();

  for (const ann of announcements) {
    await database.runAsync(
      `INSERT OR REPLACE INTO announcements
       (id, title, content, type, priority, imageUrl, isPinned, createdAt, syncedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ann.id, ann.title, ann.content, ann.type || 'news', ann.priority || 'info',
        ann.imageUrl || null, ann.isPinned ? 1 : 0, ann.createdAt, now,
      ]
    );
  }
}

export async function getLocalAnnouncements(): Promise<any[]> {
  const database = await getDatabase();
  return database.getAllAsync('SELECT * FROM announcements ORDER BY isPinned DESC, createdAt DESC') as any;
}

// ==================== NOTIFICATIONS ====================

export async function upsertNotifications(notifications: any[]) {
  const database = await getDatabase();
  const now = new Date().toISOString();

  for (const notif of notifications) {
    await database.runAsync(
      `INSERT OR REPLACE INTO notifications
       (id, type, title, message, isRead, packageId, createdAt, syncedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notif.id, notif.type, notif.title, notif.message,
        notif.isRead ? 1 : 0, notif.packageId || null, notif.createdAt, now,
      ]
    );
  }
}

export async function getLocalNotifications(): Promise<any[]> {
  const database = await getDatabase();
  return database.getAllAsync('SELECT * FROM notifications ORDER BY createdAt DESC LIMIT 50') as any;
}

// ==================== FEES ====================

export async function upsertFees(fees: any[]) {
  const database = await getDatabase();
  const now = new Date().toISOString();

  for (const fee of fees) {
    await database.runAsync(
      'INSERT OR REPLACE INTO fees (id, feeType, amount, currency, isActive, syncedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [fee.id, fee.feeType, fee.amount, fee.currency || 'USD', fee.isActive ? 1 : 0, now]
    );
  }
}

export async function getLocalFees(): Promise<any[]> {
  try {
    const cached = await getSyncMeta('cached_city_pricing');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}
  return [];
}

// ==================== SYNC META ====================

export async function getSyncMeta(key: string): Promise<string | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync('SELECT value FROM sync_meta WHERE key = ?', [key]) as any;
  return result?.value || null;
}

export async function setSyncMeta(key: string, value: string) {
  const database = await getDatabase();
  await database.runAsync('INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)', [key, value]);
}

// ==================== PENDING REQUESTS ====================

export async function getPendingRequests(): Promise<any[]> {
  const database = await getDatabase();
  return database.getAllAsync('SELECT * FROM pending_requests ORDER BY createdAt ASC') as any;
}

export async function removePendingRequest(id: number) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM pending_requests WHERE id = ?', [id]);
}

export async function clearPendingSyncFlags() {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM package_requests WHERE pendingSync = 1 AND id < 0');
}
