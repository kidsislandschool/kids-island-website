/**
 * Safe site origin. Falls back to the production domain when the env var is
 * missing or not a valid http(s) URL (e.g. placeholder values at build time).
 */
const FALLBACK = "https://www.kidsaligarh.com";

export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (raw) {
    try {
      const u = new URL(raw);
      if (u.protocol === "http:" || u.protocol === "https:") {
        return u.origin;
      }
    } catch {
      // fall through to fallback
    }
  }
  return FALLBACK;
}
