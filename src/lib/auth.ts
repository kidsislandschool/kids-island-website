import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import type { Database } from "better-sqlite3";
import { getDb } from "./db";
import { hashPassword, verifyPassword } from "./password";

export { hashPassword, verifyPassword } from "./password";

const SESSION_COOKIE = "ki_session";
const SESSION_DAYS = 7;
const MAX_FAILED_ATTEMPTS = 8;
const LOCKOUT_MINUTES = 10;

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export type Session = {
  token: string;
  user: SessionUser;
  expiresAt: string;
};

/* ------------------------------------------------------------------ hashing */

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

/* ------------------------------------------------------------------ sessions */

export async function createSession(
  user: SessionUser,
  meta: { ip?: string | null; userAgent?: string | null } = {}
): Promise<string> {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  db.prepare(
    `INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent)
     VALUES (?, ?, ?, ?, ?)`
  ).run(sha256(token), user.id, expires, meta.ip ?? null, meta.userAgent ?? null);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return token;
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getSessionByToken(token);
}

export function getSessionByToken(token: string): Session | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT s.token_hash, s.expires_at, u.id, u.email, u.name, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.revoked_at IS NULL`
    )
    .get(sha256(token)) as
    | { token_hash: string; expires_at: string; id: number; email: string; name: string; role: string }
    | undefined;
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("UPDATE sessions SET revoked_at = datetime('now') WHERE token_hash = ?").run(
      row.token_hash
    );
    return null;
  }
  return {
    token,
    expiresAt: row.expires_at,
    user: { id: row.id, email: row.email, name: row.name, role: row.role },
  };
}

/** Invalidate every session for a user except the current one. */
export function revokeOtherSessions(userId: number, currentToken: string): number {
  return getDb()
    .prepare(
      `UPDATE sessions SET revoked_at = datetime('now')
       WHERE user_id = ? AND token_hash != ? AND revoked_at IS NULL`
    )
    .run(userId, sha256(currentToken)).changes;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    getDb()
      .prepare("UPDATE sessions SET revoked_at = datetime('now') WHERE token_hash = ?")
      .run(sha256(token));
  }
  jar.delete(SESSION_COOKIE);
}

/** Server-side guard for admin layouts/pages. Redirects to the login screen. */
export async function requireAdmin(nextPath?: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const suffix = nextPath && nextPath !== "/admin" ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/staff-login${suffix}`);
  }
  if (session.user.role !== "master_admin") redirect("/staff-login");
  return session.user;
}

/** Guard for API route handlers — returns null instead of redirecting. */
export async function requireAdminApi(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || session.user.role !== "master_admin") return null;
  return session.user;
}

/* --------------------------------------------------------------- brute force */

type Attempt = { count: number; first: number };
const attempts = new Map<string, Attempt>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > windowMs) {
    attempts.set(key, { count: 1, first: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

export function checkLoginLockout(identifier: string): { locked: boolean; retryAfterSec: number } {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(*) AS c, MAX(created_at) AS last
       FROM audit_log
       WHERE action = 'login_failed' AND entity = ? AND created_at > datetime('now', ?)`
    )
    .get(identifier, `-${LOCKOUT_MINUTES} minutes`) as { c: number; last: string | null };
  if (row.c >= MAX_FAILED_ATTEMPTS) {
    const lastTs = row.last ? Date.parse(row.last + "Z") : Date.now();
    const retryAfterSec = Math.max(
      0,
      Math.ceil((lastTs + LOCKOUT_MINUTES * 60_000 - Date.now()) / 1000)
    );
    return { locked: true, retryAfterSec };
  }
  return { locked: false, retryAfterSec: 0 };
}

/* -------------------------------------------------------------------- users */

export function getMasterAdmin(db: Database = getDb()) {
  return db
    .prepare("SELECT id, email, name, role, password_hash FROM users WHERE role = 'master_admin'")
    .get() as
    | { id: number; email: string; name: string; role: string; password_hash: string }
    | undefined;
}

export function findUserByEmail(email: string, db: Database = getDb()) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase()) as
    | {
        id: number;
        email: string;
        name: string;
        role: string;
        password_hash: string;
      }
    | undefined;
}

export function setPassword(userId: number, password: string, db: Database = getDb()) {
  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(
    hashPassword(password),
    userId
  );
}

/** One-time bootstrap used by `npm run bootstrap`. */
export function createMasterAdmin(
  input: { email: string; name: string; password: string },
  db: Database = getDb()
) {
  const existing = getMasterAdmin(db);
  if (existing) throw new Error("A Master Admin already exists. Use `npm run reset-admin` instead.");
  const info = db
    .prepare(
      `INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, 'master_admin', ?)`
    )
    .run(input.email.trim().toLowerCase(), input.name, hashPassword(input.password));
  return Number(info.lastInsertRowid);
}

/* --------------------------------------------------------------- STAFF AUTH */

const STAFF_SESSION_COOKIE = "ki_staff_session";
const STAFF_SESSION_DAYS = 30;

export type StaffSessionUser = {
  id: number;
  email: string;
  name: string;
  role: "staff";
};

export type StaffSession = {
  token: string;
  user: StaffSessionUser;
  expiresAt: string;
};

export async function createStaffSession(
  user: StaffSessionUser,
  opts: { ip?: string | null; userAgent?: string | null } = {}
): Promise<string> {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + STAFF_SESSION_DAYS * 86400 * 1000).toISOString();
  db.prepare(
    `INSERT INTO staff_sessions (token_hash, user_id, expires_at, ip, user_agent)
     VALUES (?, ?, ?, ?, ?)`
  ).run(sha256(token), user.id, expiresAt, opts.ip ?? null, opts.userAgent ?? null);

  const jar = await cookies();
  jar.set(STAFF_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STAFF_SESSION_DAYS * 86400,
  });
  return token;
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const jar = await cookies();
  const token = jar.get(STAFF_SESSION_COOKIE)?.value;
  if (!token) return null;
  return getStaffSessionByToken(token);
}

export function getStaffSessionByToken(token: string): StaffSession | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT s.token_hash, s.expires_at, u.id, u.email, u.name
       FROM staff_sessions s JOIN staff u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.revoked_at IS NULL`
    )
    .get(sha256(token)) as
    | { token_hash: string; expires_at: string; id: number; email: string; name: string }
    | undefined;
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("UPDATE staff_sessions SET revoked_at = datetime('now') WHERE token_hash = ?").run(
      row.token_hash
    );
    return null;
  }
  return {
    token,
    expiresAt: row.expires_at,
    user: { id: row.id, email: row.email, name: row.name, role: "staff" },
  };
}

export async function destroyStaffSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(STAFF_SESSION_COOKIE)?.value;
  if (token) {
    getDb()
      .prepare("UPDATE staff_sessions SET revoked_at = datetime('now') WHERE token_hash = ?")
      .run(sha256(token));
  }
  jar.delete(STAFF_SESSION_COOKIE);
}

export async function requireStaff(): Promise<StaffSessionUser> {
  const session = await getStaffSession();
  if (!session) {
    redirect("/staff-login");
  }
  if (session.user.role !== "staff") redirect("/staff-login");
  return session.user;
}

export async function requireStaffApi(): Promise<StaffSessionUser | null> {
  const session = await getStaffSession();
  if (!session || session.user.role !== "staff") return null;
  return session.user;
}

/** Staff rate limiting (separate from admin) */
const staffAttempts = new Map<string, { count: number; first: number }>();

export function staffRateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = staffAttempts.get(key);
  if (!entry || now - entry.first > windowMs) {
    staffAttempts.set(key, { count: 1, first: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

export function checkStaffLoginLockout(identifier: string): { locked: boolean; retryAfterSec: number } {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(*) AS c, MAX(created_at) AS last
       FROM audit_log
       WHERE action = 'staff_login_failed' AND entity = ? AND created_at > datetime('now', ?)`
    )
    .get(identifier, `-10 minutes`) as { c: number; last: string | null };
  if (row.c >= 8) {
    const lastTs = row.last ? Date.parse(row.last + "Z") : Date.now();
    const retryAfterSec = Math.max(0, Math.ceil((lastTs + 10 * 60_000 - Date.now()) / 1000));
    return { locked: true, retryAfterSec };
  }
  return { locked: false, retryAfterSec: 0 };
}
