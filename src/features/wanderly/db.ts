import 'server-only';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { sample } from './seed';
import type { Trip } from './model';

let database: DatabaseSync | undefined;

function db() {
  if (database) return database;
  const path = resolve(/* turbopackIgnore: true */ process.env.WANDERLY_DATA_DIR || '.wanderly');
  mkdirSync(path, { recursive: true });
  const connection = new DatabaseSync(resolve(path, 'trips.sqlite'));
  connection.exec(`
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS trips (id TEXT PRIMARY KEY, document TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY);
    BEGIN IMMEDIATE;
  `);
  try {
    if (connection.prepare("INSERT OR IGNORE INTO metadata VALUES ('demo-v1')").run().changes) {
      connection
        .prepare('INSERT OR IGNORE INTO trips VALUES (?, ?)')
        .run(sample.id, JSON.stringify(sample));
    }
    connection.exec('COMMIT');
  } catch (error) {
    connection.exec('ROLLBACK');
    connection.close();
    throw error;
  }
  database = connection;
  return connection;
}

export function getTrip(id: string): Trip | undefined {
  const row = db().prepare('SELECT document FROM trips WHERE id = ?').get(id);
  return row ? JSON.parse(String(row.document)) : undefined;
}

export function getTrips(): Trip[] {
  return db()
    .prepare('SELECT document FROM trips ORDER BY rowid DESC')
    .all()
    .map((row) => JSON.parse(String(row.document)));
}

export function createTrip(trip: Trip) {
  db().prepare('INSERT INTO trips VALUES (?, ?)').run(trip.id, JSON.stringify(trip));
}

export function deleteTrip(id: string) {
  const row = db().prepare('DELETE FROM trips WHERE id = ? RETURNING document').get(id);
  return row ? (JSON.parse(String(row.document)) as Trip).entries.flatMap(entry => entry.photos || []) : [];
}

export function updateTrip(id: string, change: (trip: Trip) => void) {
  const connection = db();
  connection.exec('BEGIN IMMEDIATE');
  try {
    const trip = getTrip(id);
    if (!trip) throw new Error('Аялал олдсонгүй.');
    change(trip);
    connection.prepare('UPDATE trips SET document = ? WHERE id = ?').run(JSON.stringify(trip), id);
    connection.exec('COMMIT');
  } catch (error) {
    connection.exec('ROLLBACK');
    throw error;
  }
}
