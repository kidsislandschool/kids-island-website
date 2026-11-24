import { z } from "zod";
import { getDb } from "@/lib/db";
import { getStaffByEmail } from "@/lib/staff";
import { verifyPassword } from "@/lib/password";
import { createStaffSession, checkStaffLoginLockout, staffRateLimit } from "@/lib/auth";
import { clientIp, jsonError, logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().max(200),
  password: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!staffRateLimit(`staff_login:${ip}`, 8, 60_000)) {
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

  const { email, password } = parsed.data;
  const normalized = email.trim().toLowerCase();

  const lockout = checkStaffLoginLockout(normalized);
  if (lockout.locked) {
    return jsonError(
      `Too many failed attempts. Try again in ${Math.ceil(lockout.retryAfterSec / 60)} minute(s).`,
      429
    );
  }

  const staff = await getStaffByEmail(normalized);
  const valid = staff && verifyPassword(password, staff.password_hash);

  if (!staff || !valid) {
    logAudit({
      action: "staff_login_failed",
      entity: normalized,
      detail: { ip },
      ip,
    });
    await new Promise((r) => setTimeout(r, 350));
    return jsonError("Incorrect email or password.", 401);
  }

  if (staff.status !== "approved") {
    return jsonError(
      staff.status === "pending"
        ? "Your account is pending admin approval."
        : "Your account has been rejected. Contact admin.",
      403
    );
  }

  await createStaffSession(
    { id: staff.id, email: staff.email, name: staff.name, role: "staff" },
    { ip, userAgent: req.headers.get("user-agent") }
  );
  await getDb().from('staff').update({ last_login_at: new Date().toISOString() }).eq('id', staff.id);
  logAudit({ action: "staff_login", entity: "staff", entityId: staff.id, ip });

  return Response.json({ ok: true, redirect: "/staff/dashboard" });
}