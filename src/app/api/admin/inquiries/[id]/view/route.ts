import { supabaseAdmin } from "@/lib/supabase";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Marks a new enquiry as read when the detail screen is opened and records the
 * access in the audit log. Kept as a separate endpoint so a GET render never
 * mutates data.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const inquiryId = Number(id);
  if (!Number.isInteger(inquiryId)) return jsonError("Invalid inquiry id", 400);

  const { data: existing } = await supabaseAdmin
    .from("inquiries")
    .select("id, name, status")
    .eq("id", inquiryId)
    .maybeSingle();
  if (!existing) return jsonError("Inquiry not found", 404);

  if (existing.status === "new") {
    await supabaseAdmin
      .from("inquiries")
      .update({ status: "read", updated_at: new Date().toISOString() })
      .eq("id", inquiryId);
  }

  await logAudit({
    userId: user.id,
    action: "inquiry_viewed",
    entity: "inquiry",
    entityId: inquiryId,
    detail: { name: existing.name, previousStatus: existing.status },
    ip: clientIp(req),
  }).catch(() => {});

  return Response.json({ ok: true, status: existing.status === "new" ? "read" : existing.status });
}
