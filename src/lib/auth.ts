import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { supabaseAdmin, supabase } from "./supabase";
import { verifyPassword, hashPassword } from "./password";

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

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

/* ------------------------------------------------------------------ sessions */

export async function createSession(
  user: SessionUser,
  meta: { ip?: string | null; userAgent?: string | null } = {}
): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  
  const { error } = await supabaseAdmin
    .from('sessions')
    .insert({
      token_hash: sha256(token),
      user_id: user.id,
      expires_at: expires,
      ip: meta.ip ?? null,
      user_agent: meta.userAgent ?? null,
    });
  
  if (error) throw error;
  
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

export async function getSessionByToken(token: string): Promise<Session | null> {
  const { data: row, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      token_hash,
      expires_at,
      user_id,
      users!inner (id, email, name, role)
    `)
    .eq('token_hash', sha256(token))
    .is('revoked_at', null)
    .single();
  
  if (error || !row) return null;
  
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await supabaseAdmin
      .from('sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', row.token_hash);
    return null;
  }
  
  return {
    token,
    expiresAt: row.expires_at,
    user: { 
      id: row.users.id, 
      email: row.users.email, 
      name: row.users.name, 
      role: row.users.role 
    },
  };
}

/** Invalidate every session for a user except the current one. */
export async function revokeOtherSessions(userId: number, currentToken: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .neq('token_hash', sha256(currentToken))
    .is('revoked_at', null);
  
  if (error) throw error;
  return data?.length || 0;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await supabaseAdmin
      .from('sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', sha256(token));
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

export async function checkLoginLockout(identifier: string): Promise<{ locked: boolean; retryAfterSec: number }> {
  const { data, error, count } = await supabaseAdmin
    .from('audit_log')
    .select('*', { count: 'exact', head: true })
    .eq('action', 'login_failed')
    .eq('entity', identifier)
    .gt('created_at', new Date(Date.now() - LOCKOUT_MINUTES * 60_000).toISOString());
  
  if (error) throw error;
  
  const total = count ?? 0;
  if (total >= MAX_FAILED_ATTEMPTS) {
    // Get the most recent failed attempt
    const { data: recent } = await supabaseAdmin
      .from('audit_log')
      .select('created_at')
      .eq('action', 'login_failed')
      .eq('entity', identifier)
      .gt('created_at', new Date(Date.now() - LOCKOUT_MINUTES * 60_000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    const lastTs = recent?.length > 0 ? Date.parse(recent[0].created_at + "Z") : Date.now();
    const retryAfterSec = Math.max(
      0,
      Math.ceil((lastTs + LOCKOUT_MINUTES * 60_000 - Date.now()) / 1000)
    );
    return { locked: true, retryAfterSec };
  }
  return { locked: false, retryAfterSec: 0 };
}

/* -------------------------------------------------------------------- users */

export async function getMasterAdmin() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, role, password_hash')
    .eq('role', 'master_admin')
    .single();
  
  if (error || !data) return undefined;
  return data as { id: number; email: string; name: string; role: string; password_hash: string };
}

export async function findUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .single();
  
  if (error || !data) return undefined;
  return data as {
    id: number;
    email: string;
    name: string;
    role: string;
    password_hash: string;
  };
}

export async function setPassword(userId: number, password: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ password_hash: hashPassword(password), updated_at: new Date().toISOString() })
    .eq('id', userId);
  
  if (error) throw error;
}

/** One-time bootstrap used by `npm run bootstrap`. */
export async function createMasterAdmin(
  input: { email: string; name: string; password: string }
): Promise<number> {
  const existing = await getMasterAdmin();
  if (existing) throw new Error("A Master Admin already exists. Use `npm run reset-admin` instead.");
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      email: input.email.trim().toLowerCase(),
      name: input.name,
      role: 'master_admin',
      password_hash: hashPassword(input.password),
    })
    .select('id')
    .single();
  
  if (error) throw error;
  return data.id;
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

const STAFF_sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

export async function createStaffSession(
  user: StaffSessionUser,
  meta: { ip?: string | null; userAgent?: string | null } = {}
): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + STAFF_SESSION_DAYS * 864e5).toISOString();
  
  const { error } = await supabaseAdmin
    .from('staff_sessions')
    .insert({
      token_hash: STAFF_sha256(token),
      staff_id: user.id,
      expires_at: expires,
      ip: meta.ip ?? null,
      user_agent: meta.userAgent ?? null,
    });
  
  if (error) throw error;
  
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

export async function getStaffSessionByToken(token: string): Promise<StaffSession | null> {
  const { data: row, error } = await supabaseAdmin
    .from('staff_sessions')
    .select(`
      token_hash,
      expires_at,
      staff_id,
      staff!inner (id, email, name, status)
    `)
    .eq('token_hash', STAFF_sha256(token))
    .is('revoked_at', null)
    .single();
  
  if (error || !row) return null;
  
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await supabaseAdmin
      .from('staff_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', row.token_hash);
    return null;
  }
  
  return {
    token,
    expiresAt: row.expires_at,
    user: { 
      id: row.staff.id, 
      email: row.staff.email, 
      name: row.staff.name, 
      role: "staff" 
    },
  };
}

export async function revokeOtherStaffSessions(staffId: number, currentToken: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('staff_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('staff_id', staffId)
    .neq('token_hash', STAFF_sha256(currentToken))
    .is('revoked_at', null);
  
  if (error) throw error;
  return data?.length || 0;
}

export async function destroyStaffSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(STAFF_SESSION_COOKIE)?.value;
  if (token) {
    await supabaseAdmin
      .from('staff_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', STAFF_sha256(token));
  }
  jar.delete(STAFF_SESSION_COOKIE);
}

/** Server-side guard for staff layouts/pages. Redirects to the login screen. */
export async function requireStaff(nextPath?: string): Promise<StaffSessionUser> {
  const session = await getStaffSession();
  if (!session) {
    const suffix = nextPath && nextPath !== "/staff/dashboard" ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/staff-login${suffix}`);
  }
  if (session.user.role !== "staff") redirect("/staff-login");
  return session.user;
}

/** Guard for API route handlers — returns null instead of redirecting. */
export async function requireStaffApi(): Promise<StaffSessionUser | null> {
  const session = await getStaffSession();
  if (!session || session.user.role !== "staff") return null;
  return session.user;
}

/* --------------------------------------------------------------- staff brute force */

type StaffAttempt = { count: number; first: number };
const staffAttempts = new Map<string, { count: number; first: number }>();
const STAFF_MAX_FAILED_ATTEMPTS = 8;
const STAFF_LOCKOUT_MINUTES = 10;

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

export async function checkStaffLoginLockout(identifier: string): Promise<{ locked: boolean; retryAfterSec: number }> {
  const { count, error } = await supabaseAdmin
    .from('staff_audit_log')
    .select('*', { count: 'exact', head: true })
    .eq('action', 'staff_login_failed')
    .eq('entity', identifier)
    .gt('created_at', new Date(Date.now() - STAFF_LOCKOUT_MINUTES * 60_000).toISOString());
  
  if (error) throw error;
  
  const total = count ?? 0;
  if (total >= STAFF_MAX_FAILED_ATTEMPTS) {
    const { data: recent } = await supabaseAdmin
      .from('staff_audit_log')
      .select('created_at')
      .eq('action', 'staff_login_failed')
      .eq('entity', identifier)
      .gt('created_at', new Date(Date.now() - STAFF_LOCKOUT_MINUTES * 60_000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    const lastTs = recent?.length > 0 ? Date.parse(recent[0].created_at + "Z") : Date.now();
    const retryAfterSec = Math.max(
      0,
      Math.ceil((lastTs + STAFF_LOCKOUT_MINUTES * 60_000 - Date.now()) / 1000)
    );
    return { locked: true, retryAfterSec };
  }
  return { locked: false, retryAfterSec: 0 };
}