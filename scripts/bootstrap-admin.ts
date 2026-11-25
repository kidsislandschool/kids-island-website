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
    "Kids Island — Master Admin initial credentials",
    `Created: ${new Date().toISOString()}`,
    `Email: ${email}`,
    password ? `Password: ${password}` : "Password: supplied via ADMIN_PASSWORD (not stored here)",
    "",
    "Sign in at /staff-login, then change this password under /admin/account.",
    "Delete this file after you have signed in.",
    "",
  ];
  fs.writeFileSync(file, lines.join("\n"), { mode: 0o600 });
  return file;
}

async function main() {
  loadEnv();
  const { hashPassword } = await import("../src/lib/password");
  const { logAudit } = await import("../src/lib/audit");
  const { SupabaseDB } = await import("../src/lib/db");
  const db = SupabaseDB;

  const existing = await db.prepare("SELECT id, email FROM users WHERE role = 'master_admin'").get() as { id: number; email: string } | undefined;
  if (existing) {
    console.error("A Master Admin already exists:");
    console.error(`  ${existing.email}`);
    console.error("Use `npm run reset-admin` to set a new password.");
    process.exitCode = 1;
    return;
  }

  const email = (process.env.ADMIN_EMAIL || "admin@kids-island.local").trim().toLowerCase();
  const name = (process.env.ADMIN_NAME || "Master Admin").trim() || "Master Admin";
  const providedPassword = process.env.ADMIN_PASSWORD ?? "";
  const password = providedPassword || generatePassword();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("ADMIN_EMAIL is not a valid email address.");
    process.exitCode = 1;
    return;
  }
  if (password.length < 10) {
    console.error("ADMIN_PASSWORD must be at least 10 characters.");
    process.exitCode = 1;
    return;
  }

  const info = await db
    .prepare("INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, 'master_admin', ?)")
    .run(email, name, hashPassword(password));

  const userId = Number(info.lastInsertRowid);
  logAudit({
    userId,
    action: "admin_bootstrapped",
    entity: "master_admin",
    entityId: userId,
    detail: { email, source: providedPassword ? "environment" : "generated" },
    ip: "cli",
  });

  const credentialsFile = writeCredentials(email, providedPassword ? null : password);

  console.log("Master Admin created.");
  console.log(`  Email: ${email}`);
  console.log(`  Credentials: ${credentialsFile}`);
  console.log("Sign in at /staff-login and change the password under /admin/account.");
  console.log("Delete the credentials file after the first sign-in.");
}

void main().catch((error) => {
  console.error("Bootstrap failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});