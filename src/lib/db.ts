import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

let cached: Database.Database | null = null;

const DB_PATH = process.env.DATABASE_PATH ?? "./data/kids-island.db";

export function getDb(): Database.Database {
  if (cached) return cached;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");

  // Run migrations
  const version = db.pragma("user_version", { simple: true }) as number;
  const MIGRATIONS = getMigrations();
  for (let i = version; i < MIGRATIONS.length; i++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[i]);
      db.pragma(`user_version = ${i + 1}`);
    })();
  }

  seedIfEmpty(db);
  cached = db;
  return cached;
}

function getMigrations(): string[] {
  return [
    // 0: Initial schema
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'master_admin',
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

    CREATE TABLE IF NOT EXISTS content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity TEXT,
      entity_id TEXT,
      detail TEXT,
      ip TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      summary TEXT,
      body TEXT,
      event_date TEXT,
      pinned INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'published',
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_by INTEGER REFERENCES staff(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
    CREATE INDEX IF NOT EXISTS idx_notices_created_by ON notices(created_by);

    CREATE TABLE IF NOT EXISTS faculty (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      designation TEXT,
      subjects TEXT,
      qualification TEXT,
      bio TEXT,
      photo TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'published',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      class_level TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      file_url TEXT,
      tags TEXT,
      published_at TEXT,
      status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'published',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_by INTEGER REFERENCES staff(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_materials_created_by ON materials(created_by);

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_role TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'needs_review',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      order_index INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'needs_review',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gallery_albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      cover_photo TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'published',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gallery_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      album_id INTEGER NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      caption TEXT,
      alt TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'published',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_photos_album ON gallery_photos(album_id);

    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      url TEXT NOT NULL,
      mime TEXT NOT NULL,
      size INTEGER NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('image','document')),
      alt TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      designation TEXT,
      qualification TEXT,
      bio TEXT,
      photo TEXT,
      password_hash TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
      approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      approved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
    CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);

    CREATE TABLE IF NOT EXISTS staff_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      ip TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_staff_sessions_token ON staff_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_staff_sessions_user ON staff_sessions(user_id);
    `,
  ];
}

function seedIfEmpty(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) AS c FROM content").get() as { c: number };
  if (count.c > 0) return;
  console.log("Database initialized. Run 'npm run db:seed' to populate content.");
}