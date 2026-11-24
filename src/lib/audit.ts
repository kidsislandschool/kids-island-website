import { getDb } from "./db";

/* ---------------------------------------------------------------- audit log */

export function logAudit(input: {
  userId?: number | null;
  action: string;
  entity?: string | null;
  entityId?: string | number | null;
  detail?: unknown;
  ip?: string | null;
}) {
  getDb()
    .prepare(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, detail, ip)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.userId ?? null,
      input.action,
      input.entity ?? null,
      input.entityId != null ? String(input.entityId) : null,
      input.detail != null ? JSON.stringify(input.detail) : null,
      input.ip ?? null
    );
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

export function listAudit(
  opts: { limit?: number; offset?: number; action?: string; entity?: string } = {}
) {
  const db = getDb();
  const limit = Math.min(opts.limit ?? 50, 200);
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.action) {
    where.push("a.action LIKE ?");
    params.push(`%${opts.action}%`);
  }
  if (opts.entity) {
    where.push("a.entity = ?");
    params.push(opts.entity);
  }
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `SELECT a.*, u.name FROM audit_log a
       LEFT JOIN users u ON u.id = a.user_id
       ${sqlWhere}
       ORDER BY a.created_at DESC, a.id DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, opts.offset ?? 0) as AuditRow[];
  const total = (
    db.prepare(`SELECT COUNT(*) AS c FROM audit_log a ${sqlWhere}`).get(...params) as { c: number }
  ).c;
  return { rows, total };
}

/** Distinct entity names recorded in the audit log (for the admin filter). */
export function auditEntities(): { entity: string; count: number }[] {
  return getDb()
    .prepare(
      `SELECT entity, COUNT(*) AS count FROM audit_log
       WHERE entity IS NOT NULL AND entity != ''
       GROUP BY entity ORDER BY count DESC, entity ASC`
    )
    .all() as { entity: string; count: number }[];
}

/* ------------------------------------------------------- request helpers */

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}

/**
 * Same-origin check for state-changing API requests (CSRF defence on top of
 * SameSite=Lax cookies).
 */
export function assertSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser client (same-site cookie still required)
  try {
    const host = req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
