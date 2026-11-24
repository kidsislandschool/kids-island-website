import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "./load-env";

function generatePassword(length = 24) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_";
  const bytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) password += alphabet[bytes[i] % alphabet.length];
  return password;
}

function writeCredentials(email: string, password: string | null) {
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "initial-admin.txt");
  const lines = [
    "Kids Island — Master Admin password reset",
    `Reset: ${new Date().toISOString()}`,
    `Email: ${email}`,
    password ? `Password: ${password}` : "Password: supplied via ADMIN_PASSWORD (not stored here)",
    "",
    "All previous admin sessions have been signed out.",
    "Sign in at /staff-login and change this password under /admin/account.",
    "Delete this file after you have signed in.",
    "",
  ];
  fs.writeFileSync(file, lines.join("\n"), { mode: 0o600 });
  return file;
}

async function main() {
  loadEnv();
  const { getDb } = await import("../src/lib/db");
  const { hashPassword } = await import("../src/lib/password");
  const { logAudit } = await import("../src/lib/audit");

  const db = getDb();
  const user = db
    .prepare("SELECT id, email FROM users WHERE role = 'master_admin'")
    .get() as { id: number; email: string } | undefined;
  if (!user) {
    console.error("No Master Admin exists yet. Run `npm run bootstrap` first.");
    process.exitCode = 1;
    return;
  }

  const providedPassword = process.env.ADMIN_PASSWORD ?? "";
  const password = providedPassword || generatePassword();
  if (password.length < 12) {
    console.error("ADMIN_PASSWORD must be at least 12 characters.");
    process.exitCode = 1;
    return;
  }

  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(
    hashPassword(password),
    user.id
  );
  const revoked = db
    .prepare(
      "UPDATE sessions SET revoked_at = datetime('now') WHERE user_id = ? AND revoked_at IS NULL"
    )
    .run(user.id).changes;

  logAudit({
    userId: user.id,
    action: "admin_password_reset",
    entity: "master_admin",
    entityId: user.id,
    detail: { email: user.email, sessionsRevoked: revoked, source: providedPassword ? "environment" : "generated" },
    ip: "cli",
  });

  const credentialsFile = writeCredentials(user.email, providedPassword ? null : password);
  db.close();

  console.log("Master Admin password reset.");
  console.log(`  Email: ${user.email}`);
  console.log(`  Sessions revoked: ${revoked}`);
  console.log(`  Credentials: ${credentialsFile}`);
  console.log("Delete the credentials file after signing in.");
}

void main().catch((error) => {
  console.error("Reset failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
