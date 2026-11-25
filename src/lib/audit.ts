import { supabaseAdmin } from "./supabase";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/** Check that the request originates from the same origin (CSRF protection). */
export function assertSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  // Check host header, also check x-forwarded-host for custom domains behind Vercel edge
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  // Allow requests without origin header (e.g., server-to-server, curl)
  if (!origin) return true;
  if (!host) return false;
  try {
    const originHost = new URL(origin).host;
    // Allow custom domains: kidsaligarh.com, www.kidsaligarh.com
    const allowedHosts = ["kidsaligarh.com", "www.kidsaligarh.com"];
    if (allowedHosts.includes(originHost) && allowedHosts.includes(host)) {
      return true;
    }
    return originHost === host;
  } catch {
    return false;
  }
}

/** Extract client IP from request headers. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/** Standard JSON error response. */
export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/* ---------------------------------------------------------------- audit log */

export async function logAudit(input: {
  userId?: number | null;
  action: string;
  entity?: string | null;
  entityId?: string | number | null;
  detail?: unknown;
  ip?: string | null;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from('audit_log')
    .insert({
      user_id: input.userId ?? null,
      action: input.action,
      entity: input.entity ?? null,
      entity_id: input.entityId != null ? String(input.entityId) : null,
      detail: input.detail != null ? JSON.stringify(input.detail) : null,
      ip: input.ip ?? null,
    });
  
  if (error) throw error;
}

export type AuditRow = {
  id: number;
  user_id: number | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  detail: string | null;
  ip: string | null;
  created_at: string;
  name?: string | null;
};

export async function listAudit(
  opts: { limit?: number; offset?: number; action?: string; entity?: string } = {}
) {
  const limit = Math.min(opts.limit ?? 50, 200);
  
  let query = supabaseAdmin
    .from('audit_log')
    .select(`
      *,
      users!left (name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  
  if (opts.action) {
    query = query.ilike('action', `%${opts.action}%`);
  }
  if (opts.entity) {
    query = query.eq('entity', opts.entity);
  }
  
  query = query
    .range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 50) - 1);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  const rows = (data || []).map(row => ({
    ...row,
    name: row.users?.name ?? null,
  })) as AuditRow[];
  
  return { rows, total: count ?? 0 };
}

/** Distinct entity names recorded in the audit log (for the admin filter). */
export async function auditEntities(): Promise<{ entity: string; count: number }[]> {
  const { data, error } = await supabaseAdmin
    .from('audit_log')
    .select('entity')
    .not('entity', 'is', null)
    .neq('entity', '');
  
  if (error) throw error;
  
  const entityCounts = new Map<string, number>();
  (data || []).forEach(row => {
    if (row.entity) {
      entityCounts.set(row.entity, (entityCounts.get(row.entity) || 0) + 1);
    }
  });
  
  return Array.from(entityCounts.entries())
    .map(([entity, count]) => ({ entity, count }))
    .sort((a, b) => b.count - a.count || a.entity.localeCompare(b.entity));
}

export async function listAuditForAdmin(
  opts: { limit?: number; offset?: number; action?: string; entity?: string; userId?: number } = {}
) {
  const limit = Math.min(opts.limit ?? 50, 200);
  
  let query = supabaseAdmin
    .from('audit_log')
    .select(`
      *,
      users!left (name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  
  if (opts.action) {
    query = query.ilike('action', `%${opts.action}%`);
  }
  if (opts.entity) {
    query = query.eq('entity', opts.entity);
  }
  if (opts.userId) {
    query = query.eq('user_id', opts.userId);
  }
  
  query = query
    .range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 50) - 1);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  const rows = (data || []).map(row => ({
    ...row,
    name: row.users?.name ?? null,
  })) as AuditRow[];
  
  return { rows, total: count ?? 0 };
}

export async function logStaffAudit(input: {
  staffId?: number | null;
  action: string;
  entity?: string | null;
  entityId?: string | number | null;
  detail?: unknown;
  ip?: string | null;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from('staff_audit_log')
    .insert({
      staff_id: input.staffId ?? null,
      action: input.action,
      entity: input.entity ?? null,
      entity_id: input.entityId != null ? String(input.entityId) : null,
      detail: input.detail != null ? JSON.stringify(input.detail) : null,
      ip: input.ip ?? null,
    });
  
  if (error) throw error;
}