import { getDb } from "./db";

export type ContentStatus = "published" | "draft" | "needs_review";

export type ContentRecord = {
  key: string;
  /** JSON-encoded value as stored in SQLite. */
  value: string;
  status: ContentStatus;
  updated_at: string;
  updated_by: number | null;
};

/**
 * Read a content block.
 * `opts.publicOnly` (default true) hides draft / needs-review content from
 * the public site until a Master Admin publishes it.
 */
export function getContent<T>(key: string, fallback: T, opts?: { publicOnly?: boolean }): T {
  const db = getDb();
  const row = db.prepare("SELECT * FROM content WHERE key = ?").get(key) as
    | ContentRecord
    | undefined;
  if (!row) return fallback;
  const publicOnly = opts?.publicOnly ?? true;
  if (publicOnly && row.status !== "published") return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

/** Read raw record (including status) — used by the admin. */
export function getContentRecord(key: string): ContentRecord | undefined {
  return getDb().prepare("SELECT * FROM content WHERE key = ?").get(key) as
    | ContentRecord
    | undefined;
}

export function listContent(prefix?: string): ContentRecord[] {
  const db = getDb();
  if (prefix) {
    return db
      .prepare("SELECT * FROM content WHERE key LIKE ? ORDER BY key")
      .all(`${prefix}%`) as ContentRecord[];
  }
  return db.prepare("SELECT * FROM content ORDER BY key").all() as ContentRecord[];
}

export function setContent(
  key: string,
  value: unknown,
  status: ContentStatus,
  userId?: number | null
) {
  getDb()
    .prepare(
      `INSERT INTO content (key, value, status, updated_at, updated_by)
       VALUES (?, ?, ?, datetime('now'), ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         status = excluded.status,
         updated_at = datetime('now'),
         updated_by = excluded.updated_by`
    )
    .run(key, JSON.stringify(value), status, userId ?? null);
}

/** Count content blocks waiting for review (drives the admin badge). */
export function countNeedsReview(): { content: number; testimonials: number; faqs: number } {
  const db = getDb();
  const c = db
    .prepare("SELECT COUNT(*) AS c FROM content WHERE status = 'needs_review'")
    .get() as { c: number };
  const t = db
    .prepare("SELECT COUNT(*) AS c FROM testimonials WHERE status = 'needs_review'")
    .get() as { c: number };
  const f = db
    .prepare("SELECT COUNT(*) AS c FROM faqs WHERE status = 'needs_review'")
    .get() as { c: number };
  return { content: c.c, testimonials: t.c, faqs: f.c };
}

/* ------------------------------------------------------------ typed helpers */

export type SiteSettings = {
  name: string;
  shortName: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  whatsapp: string;
  whatsappNote: string;
  hoursPhone: string;
  hoursOffice: string;
  logoText: string;
  socials: { label: string; url: string }[];
  affiliation: string;
};

export function getSiteSettings(): SiteSettings {
  return getContent<SiteSettings>("settings.site", {
    name: "Kids Island Senior Secondary School",
    shortName: "Kids Island",
    tagline: "Shaping bright futures through quality education",
    location: "Aligarh, Uttar Pradesh, India — 202001",
    phone: "+91 9012655655",
    email: "contact@kidsaligarh.com",
    whatsapp: "+91 9997973574",
    whatsappNote: "",
    hoursPhone: "",
    hoursOffice: "",
    logoText: "Kids Island",
    socials: [],
    affiliation: "",
  });
}

export function getAffiliation(): string {
  return getContent<string>("settings.affiliation", "");
}

export type PageSeo = {
  title: string;
  description: string;
  /** Optional social sharing image (uploaded or absolute URL). */
  ogImage?: string;
  /** Optional canonical override. Defaults to the page path. */
  canonical?: string;
};

/** Per-page SEO overrides managed in /admin/seo. */
export function getSeo(path: string, fallback: PageSeo): PageSeo {
  const all = getContent<Record<string, PageSeo>>("settings.seo", {});
  const entry = all[path];
  return entry?.title ? entry : fallback;
}

export function getNav() {
  return getContent<{
    links: { label: string; href: string }[];
    cta: { label: string; href: string };
  }>("settings.nav", {
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
    ],
    cta: { label: "Apply for Admission", href: "/admissions#inquiry" },
  });
}

export function getFooter() {
  return getContent<{
    blurb: string;
    quickLinks: { label: string; href: string }[];
    resources: { label: string; href: string }[];
    legal: { label: string; href: string }[];
    copyright: string;
  }>("settings.footer", {
    blurb: "",
    quickLinks: [],
    resources: [],
    legal: [],
    copyright: "Kids Island Senior Secondary School, Aligarh.",
  });
}
