import { supabaseAdmin } from "@/lib/supabase";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { getSession, revokeOtherSessions, setPassword, verifyPassword } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120).optional(),
  email: z.string().trim().email("Enter a valid email address").max(200).optional(),
  currentPassword: z.string().max(200).optional(),
  newPassword: z.string().max(200).optional(),
});

export async function PATCH(req: Request) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const session = await getSession();
  if (!session || session.user.role !== "master_admin") return jsonError("Unauthorized", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the form." }, { status: 422 });
  }

  const { name, email, currentPassword, newPassword } = parsed.data;
  if (!name && !email && !newPassword) return jsonError("Nothing to update", 422);

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, email, password_hash")
    .eq("id", session.user.id)
    .maybeSingle();
  if (!user) return jsonError("Account not found", 404);

  const updates: Record<string, unknown> = {};
  const auditDetail: Record<string, unknown> = {};

  if (name && name !== session.user.name) {
    updates.name = name;
    auditDetail.name = name;
  }

  if (email && email.toLowerCase() !== user.email) {
    const { data: exists } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .neq("id", user.id)
      .maybeSingle();
    if (exists) return jsonError("That email is already in use.", 422);
    updates.email = email.toLowerCase();
    auditDetail.email = email.toLowerCase();
  }

  if (newPassword) {
    if (newPassword.length < 12) {
      return jsonError("Use at least 12 characters for the new password.", 422);
    }
    if (!currentPassword || !verifyPassword(currentPassword, user.password_hash)) {
      return jsonError("Your current password is incorrect.", 422);
    }
    await setPassword(user.id, newPassword);
    auditDetail.passwordChanged = true;
    auditDetail.sessionsRevoked = await revokeOtherSessions(user.id, session.token);
  }

  if (Object.keys(updates).length) {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) return jsonError(error.message, 500);
  }

  if (Object.keys(auditDetail).length) {
    await logAudit({
      userId: user.id,
      action: auditDetail.passwordChanged ? "password_changed" : "account_updated",
      entity: "user",
      entityId: user.id,
      detail: auditDetail,
      ip: clientIp(req),
    }).catch(() => {});
  }

  return Response.json({ ok: true });
}
