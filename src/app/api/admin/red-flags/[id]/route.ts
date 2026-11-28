import { assertSameOrigin, clientIp, logAudit } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const user = await requireAdminApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const flagId = Number(id);
  if (!Number.isInteger(flagId)) return Response.json({ error: "Invalid flag ID" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { resolved, resolutionNote } = (body ?? {}) as {
    resolved?: boolean;
    resolutionNote?: string | null;
  };

  if (typeof resolved !== "boolean") {
    return Response.json({ error: "resolved must be true or false" }, { status: 422 });
  }

  try {
    const { data: existing, error: findError } = await supabaseAdmin
      .from("red_flags")
      .select("id, student_id")
      .eq("id", flagId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return Response.json({ error: "Red flag not found" }, { status: 404 });

    const { data: updated, error } = await supabaseAdmin
      .from("red_flags")
      .update({
        resolved,
        resolved_by: resolved ? user.id : null,
        resolved_at: resolved ? new Date().toISOString() : null,
        resolution_note: resolutionNote?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", flagId)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      userId: user.id,
      action: resolved ? "red_flag_resolved" : "red_flag_reopened",
      entity: "red_flags",
      entityId: flagId,
      detail: { studentId: existing.student_id, resolutionNote: resolutionNote ?? null },
      ip: clientIp(req),
    }).catch(() => {});

    return Response.json({ ok: true, row: updated });
  } catch (error) {
    console.error("PATCH /api/admin/red-flags/[id] error:", error);
    return Response.json({ error: "Failed to update red flag" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const user = await requireAdminApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const flagId = Number(id);
  if (!Number.isInteger(flagId)) return Response.json({ error: "Invalid flag ID" }, { status: 400 });

  try {
    const { data: existing, error: findError } = await supabaseAdmin
      .from("red_flags")
      .select("id, student_id")
      .eq("id", flagId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return Response.json({ error: "Red flag not found" }, { status: 404 });

    const { error } = await supabaseAdmin.from("red_flags").delete().eq("id", flagId);
    if (error) throw error;

    await logAudit({
      userId: user.id,
      action: "red_flag_deleted",
      entity: "red_flags",
      entityId: flagId,
      detail: { studentId: existing.student_id },
      ip: clientIp(req),
    }).catch(() => {});

    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/red-flags/[id] error:", error);
    return Response.json({ error: "Failed to delete red flag" }, { status: 500 });
  }
}
