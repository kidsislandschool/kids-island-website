import { getDb } from "@/lib/db";
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

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.user.id) as
    | { id: number; email: string; password_hash: string }
    | undefined;
  if (!user) return jsonError("Account not found", 404);

  const updates: string[] = [];
  const params: unknown[] = [];
  const auditDetail: Record<string, unknown> = {};

  if (name && name !== session.user.name) {
    updates.push("name = ?");
    params.push(name);
    auditDetail.name = name;
  }

  if (email && email.toLowerCase() !== user.email) {
    const exists = db.prepare("SELECT 1 AS ok FROM users WHERE email = ? AND id != ?").get(
      email.toLowerCase(),
      user.id
    );
    if (exists) return jsonError("That email is already in use.", 422);
    updates.push("email = ?");
    params.push(email.toLowerCase());
    auditDetail.email = email.toLowerCase();
  }

  if (newPassword) {
    if (newPassword.length < 12) {
      return jsonError("Use at least 12 characters for the new password.", 422);
    }
    if (!currentPassword || !verifyPassword(currentPassword, user.password_hash)) {
      return jsonError("Your current password is incorrect.", 422);
    }
    setPassword(user.id, newPassword);
    const revoked = revokeOtherSessions(user.id, session.token);
    auditDetail.passwordChanged = true;
    auditDetail.sessionsRevoked = revoked;
  }

  if (updates.length) {
    db.prepare(
      `UPDATE users SET ${updates.join(", ")}, updated_at = datetime('now') WHERE id = ?`
    ).run(...params, user.id);
  }

  if (Object.keys(auditDetail).length) {
    logAudit({
      userId: user.id,
      action: auditDetail.passwordChanged ? "password_changed" : "account_updated",
      entity: "user",
      entityId: user.id,
      detail: auditDetail,
      ip: clientIp(req),
    });
  }

  return Response.json({ ok: true });
}
