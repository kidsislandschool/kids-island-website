import { requireAdminApi } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await requireAdminApi();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const facultyId = Number(id);
  if (!Number.isFinite(facultyId)) return Response.json({ error: "Invalid ID" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { status } = body as { status?: string };
  if (!status || !["published", "draft", "needs_review"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data: faculty, error: fetchError } = await supabaseAdmin
    .from("faculty")
    .select("*")
    .eq("id", facultyId)
    .single();

  if (fetchError || !faculty) {
    return Response.json({ error: "Faculty profile not found" }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("faculty")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", facultyId);

  if (error) {
    console.error("Failed to update faculty status:", error);
    return Response.json({ error: "Could not update faculty status." }, { status: 500 });
  }

  logAudit({
    userId: user.id,
    action: `faculty_${status === "published" ? "approved" : "rejected"}`,
    entity: "faculty",
    entityId: String(facultyId),
    detail: { name: faculty.name, email: faculty.email, previousStatus: faculty.status, newStatus: status },
    ip: clientIp(req),
  });

  return Response.json({ ok: true });
}