import { supabaseAdmin } from "@/lib/supabase";
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

  const { data: existing } = await supabaseAdmin
    .from("inquiries")
    .select("id, status, name")
    .eq("id", inquiryId)
    .maybeSingle();
  if (!existing) return jsonError("Inquiry not found", 404);

  const { error } = await supabaseAdmin
    .from("inquiries")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", inquiryId);
  if (error) return jsonError(error.message, 500);

  await logAudit({
    userId: user.id,
    action: "inquiry_updated",
    entity: "inquiry",
    entityId: inquiryId,
    detail: { status, previousStatus: existing.status },
    ip: clientIp(req),
  }).catch(() => {});

  return Response.json({ ok: true });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const inquiryId = Number(id);
  if (!Number.isInteger(inquiryId)) return jsonError("Invalid inquiry id", 400);

  const { data: existing } = await supabaseAdmin
    .from("inquiries")
    .select("id, name")
    .eq("id", inquiryId)
    .maybeSingle();
  if (!existing) return jsonError("Inquiry not found", 404);

  const { error } = await supabaseAdmin.from("inquiries").delete().eq("id", inquiryId);
  if (error) return jsonError(error.message, 500);

  await logAudit({
    userId: user.id,
    action: "inquiry_deleted",
    entity: "inquiry",
    entityId: inquiryId,
    detail: { name: existing.name },
    ip: clientIp(req),
  }).catch(() => {});

  return Response.json({ ok: true });
}
