import { getDirectDb } from "@/lib/db";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const staffId = Number(id);
  if (!Number.isInteger(staffId)) return jsonError("Invalid staff id", 400);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const status = (body as { status?: unknown })?.status;
  if (status !== "approved" && status !== "rejected") {
    return jsonError("Choose a valid status (approved/rejected)", 422);
  }

  const db = getDirectDb();
  const existing = await db.selectOne('staff', '*', { id: staffId }) as
    | {
        id: number;
        status: string;
        name: string;
        email: string;
        designation: string | null;
        qualification: string | null;
        bio: string | null;
        photo: string | null;
      }
    | undefined;
  if (!existing) return jsonError("Staff not found", 404);

  if (existing.status !== "pending") {
    return jsonError("Only pending staff can be approved or rejected.", 422);
  }

  await db.update('staff', {
    status,
    approved_by: user.id,
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { id: staffId });

  // If approved, also create faculty profile from staff data
  if (status === "approved") {
    const existingFaculty = await db.selectOne('faculty', '*', { email: existing.email });
    if (!existingFaculty) {
      await db.insert('faculty', {
        name: existing.name,
        email: existing.email,
        designation: existing.designation || 'Faculty Member',
        qualification: existing.qualification || '',
        subjects: '',
        bio: existing.bio || '',
        photo: existing.photo || null,
        status: 'published',
        order_index: 0,
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  logAudit({
    userId: user.id,
    action: `staff_${status}`,
    entity: "staff",
    entityId: staffId,
    detail: { name: existing.name, email: existing.email, previousStatus: existing.status },
    ip: clientIp(req),
  });

  if (status === "approved") revalidatePublicSite();

  return Response.json({ ok: true, status });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const user = await requireAdminApi();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const staffId = Number(id);
  if (!Number.isInteger(staffId) || staffId <= 0) return jsonError("Invalid staff id", 400);

  const db = getDirectDb();
  const existing = (await db.selectOne("staff", "id, name, email, status", {
    id: staffId,
  })) as { id: number; name: string; email: string; status: string } | undefined;

  if (!existing) return jsonError("Staff not found", 404);

  try {
    // Revoke every active sign-in session for this account.
    const { error: sessionError } = await supabaseAdmin
      .from("staff_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", staffId)
      .is("revoked_at", null);
    if (sessionError) throw sessionError;

    // Unpublish the linked public profile instead of erasing its content.
    if (existing.email) {
      const { error: facultyError } = await supabaseAdmin
        .from("faculty")
        .update({ status: "draft", updated_at: new Date().toISOString() })
        .eq("email", existing.email);
      if (facultyError) throw facultyError;
    }

    const { error: deleteError } = await supabaseAdmin.from("staff").delete().eq("id", staffId);
    if (deleteError) throw deleteError;

    await logAudit({
      userId: user.id,
      action: "staff_deleted",
      entity: "staff",
      entityId: staffId,
      detail: { name: existing.name, email: existing.email, previousStatus: existing.status },
      ip: clientIp(req),
    }).catch(() => {});

    revalidatePublicSite();

    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/staff/[id] error:", error);
    return jsonError("Could not delete this staff account. Please try again.", 500);
  }
}