import crypto from "node:crypto";

/**
 * Password hashing helpers kept free of Next.js imports so CLI scripts can use
 * the exact same format as the running app.
 */

export function hashPassword(password: string, salt?: Buffer) {
  const s = salt ?? crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, s, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${s.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algo, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  const actual = crypto.scryptSync(password, salt, expected.length, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return crypto.timingSafeEqual(actual, expected);
}
