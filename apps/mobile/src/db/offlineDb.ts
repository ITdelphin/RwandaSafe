import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('rwanda_safe_offline.db');

export function initOfflineDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS offline_queue (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      media_paths TEXT,
      created_at TEXT NOT NULL,
      retry_count INTEGER DEFAULT 0,
      last_error TEXT
    );
  `);
}

export function queueIncident(id: string, payload: object, mediaPaths: string[]) {
  db.runSync(
    `INSERT INTO offline_queue (id, payload, media_paths, created_at) VALUES (?, ?, ?, ?)`,
    [id, JSON.stringify(payload), JSON.stringify(mediaPaths), new Date().toISOString()]
  );
}

export function getQueuedIncidents() {
  return db.getAllSync<any>(`SELECT * FROM offline_queue ORDER BY created_at ASC`);
}

export function removeFromQueue(id: string) {
  db.runSync(`DELETE FROM offline_queue WHERE id = ?`, [id]);
}

export function incrementRetryCount(id: string, error: string) {
  db.runSync(
    `UPDATE offline_queue SET retry_count = retry_count + 1, last_error = ? WHERE id = ?`,
    [error, id]
  );
}
