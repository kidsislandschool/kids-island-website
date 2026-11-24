import { getDb } from "@/lib/db";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "read", "replied", "closed"] as const;

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const inquiryId = Number(id);
  if (!Number.isInteger(inquiryId)) return jsonError("Invalid inquiry id", 400);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const status = (body as { status?: unknown })?.status;
  if (typeof status !== "string" || !(STATUSES as readonly string[]).includes(status)) {
    return jsonError("Choose a valid inquiry status", 422);
  }

  const db = getDb();
  const existing = db.prepare("SELECT * FROM inquiries WHERE id = ?").get(inquiryId) as
    | { id: number; status: string; name: string }
    | undefined;
  if (!existing) return jsonError("Inquiry not found", 404);

  db.prepare("UPDATE inquiries SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
    status,
    inquiryId
  );

  logAudit({
    userId: user.id,
    action: "inquiry_updated",
    entity: "inquiry",
    entityId: inquiryId,
    detail: { status, previousStatus: existing.status },
    ip: clientIp(req),
  });

  return Response.json({ ok: true });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const inquiryId = Number(id);
  if (!Number.isInteger(inquiryId)) return jsonError("Invalid inquiry id", 400);

  const db = getDb();
  const existing = db.prepare("SELECT * FROM inquiries WHERE id = ?").get(inquiryId) as
    | { id: number; name: string }
    | undefined;
  if (!existing) return jsonError("Inquiry not found", 404);

  db.prepare("DELETE FROM inquiries WHERE id = ?").run(inquiryId);
  logAudit({
    userId: user.id,
    action: "inquiry_deleted",
    entity: "inquiry",
    entityId: inquiryId,
    detail: { name: existing.name },
    ip: clientIp(req),
  });

  return Response.json({ ok: true });
}
