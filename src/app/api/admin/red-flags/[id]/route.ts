import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

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

  const { resolved, resolutionNote } = body as {
    resolved: boolean;
    resolutionNote?: string;
  };

  try {
    const existing = await supabaseAdmin
      .from("red_flags")
      .select("*")
      .eq("id", flagId)
      .single();

    if (!existing) return Response.json({ error: "Red flag not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {
      resolved,
      resolved_by: resolved ? user.id : null,
      resolved_at: resolved ? new Date().toISOString() : null,
      resolution_note: resolutionNote ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await supabaseAdmin
      .from("red_flags")
      .update(updateData)
      .eq("id", flagId)
      .select()
      .single();

    if (error) throw error;

    logAudit({
      userId: user.id,
      action: resolved ? "red_flag_resolved" : "red_flag_reopened",
      entity: "red_flags",
      entityId: flagId,
      detail: { studentId: existing.student_id, resolutionNote },
      ip: clientIp(new Request("http://localhost")) as string,
    });

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
    const { error } = await supabaseAdmin
      .from("red_flags")
      .delete()
      .eq("id", flagId);

    if (error) throw error;

    logAudit({
      userId: user.id,
      action: "red_flag_deleted",
      entity: "red_flags",
      entityId: flagId,
      ip: clientIp(new Request("http://localhost")) as string,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/red-flags/[id] error:", error);
    return Response.json({ error: "Failed to delete red flag" }, { status: 500 });
  }
}