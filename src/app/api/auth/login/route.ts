import { z } from "zod";
import {
  checkLoginLockout,
  createSession,
  findUserByEmail,
  getMasterAdmin,
  rateLimit,
  verifyPassword,
} from "@/lib/auth";
import { assertSameOrigin, clientIp, jsonError, logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";

const schema = z.object({
  email: z.string().trim().max(200),
  password: z.string().min(1).max(200),
  next: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return jsonError("Invalid request origin", 403);
  const ip = clientIp(req);
  if (!rateLimit(`login:${ip}`, 8, 60_000)) {
    return jsonError("Too many attempts. Please wait a minute and try again.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Enter your email and password.", 422);

  const { email, password, next } = parsed.data;
  const normalized = email.trim().toLowerCase();

  const lockout = checkLoginLockout(normalized);
  if (lockout.locked) {
    return jsonError(
      `Too many failed attempts. Try again in ${Math.ceil(lockout.retryAfterSec / 60)} minute(s).`,
      429
    );
  }

  const user = findUserByEmail(normalized);
  const master = getMasterAdmin();
  const valid = user && verifyPassword(password, user.password_hash);

  if (!user || !valid || user.role !== "master_admin") {
    logAudit({
      action: "login_failed",
      entity: normalized,
      detail: { ip },
      ip,
    });
    // Small constant-ish delay to slow down automated probing.
    await new Promise((r) => setTimeout(r, 350));
    return jsonError("Incorrect email or password.", 401);
  }

  if (!master) return jsonError("Master Admin is not configured.", 500);

  await createSession(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    { ip, userAgent: req.headers.get("user-agent") }
  );
  getDb().prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);
  logAudit({ userId: user.id, action: "login", entity: "master_admin", entityId: user.id, ip });

  const redirect =
    next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  return Response.json({ ok: true, redirect });
}
