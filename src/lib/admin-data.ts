import { getDb } from "./db";
import { COLLECTIONS, allowedColumns, type CollectionDef } from "./collections";

export type AdminRow = Record<string, unknown> & { id: number };

/** Validate collection key, returning its definition. */
export function getCollectionDef(key: string): CollectionDef | undefined {
  return COLLECTIONS[key];
}

export function getCollectionRows(
  key: string,
  opts: { search?: string; status?: string; page?: number; perPage?: number } = {}
) {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  const db = getDb();
  const where: string[] = [];
  const params: unknown[] = [];

  if (opts.status && opts.status !== "all") {
    if (opts.status === "needs_review" || opts.status === "published" || opts.status === "draft") {
      where.push("status = ?");
      params.push(opts.status);
    }
  }

  const searchFields = def.fields.filter((f) => f.searchable).map((f) => f.name);
  if (opts.search && searchFields.length) {
    where.push(`(${searchFields.map((f) => `${f} LIKE ?`).join(" OR ")})`);
    const q = `%${opts.search}%`;
    for (let i = 0; i < searchFields.length; i++) params.push(q);
  }

  const perPage = Math.min(opts.perPage ?? 50, 200);
  const page = Math.max(opts.page ?? 1, 1);
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM ${def.table} ${sqlWhere} ORDER BY ${def.orderBy} LIMIT ? OFFSET ?`)
    .all(...params, perPage, (page - 1) * perPage) as AdminRow[];
  const total = (
    db.prepare(`SELECT COUNT(*) AS c FROM ${def.table} ${sqlWhere}`).get(...params) as { c: number }
  ).c;

  return { rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export function getCollectionRow(key: string, id: number): AdminRow | undefined {
  const def = getCollectionDef(key);
  if (!def) return undefined;
  return getDb().prepare(`SELECT * FROM ${def.table} WHERE id = ?`).get(id) as AdminRow | undefined;
}

export function createCollectionRow(key: string, data: Record<string, unknown>): AdminRow {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  const cols = Object.keys(data).filter((c) => allowedColumns(def).has(c));
  const placeholders = cols.map(() => "?").join(", ");
  const info = getDb()
    .prepare(`INSERT INTO ${def.table} (${cols.join(", ")}) VALUES (${placeholders})`)
    .run(...cols.map((c) => data[c]));
  return getCollectionRow(key, Number(info.lastInsertRowid)) as AdminRow;
}

export function updateCollectionRow(key: string, id: number, data: Record<string, unknown>): AdminRow | undefined {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  const cols = Object.keys(data).filter((c) => allowedColumns(def).has(c));
  if (!cols.length) return getCollectionRow(key, id);
  const assignments = cols.map((c) => `${c} = ?`).join(", ");
  getDb()
    .prepare(`UPDATE ${def.table} SET ${assignments}, updated_at = datetime('now') WHERE id = ?`)
    .run(...cols.map((c) => data[c]), id);
  return getCollectionRow(key, id);
}

export function deleteCollectionRow(key: string, id: number): boolean {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  return getDb().prepare(`DELETE FROM ${def.table} WHERE id = ?`).run(id).changes > 0;
}

/** Status totals for a collection (published / draft / needs review). */
export function getCollectionStatusCounts(key: string): {
  published: number;
  draft: number;
  needs_review: number;
  total: number;
} {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  const rows = getDb()
    .prepare(`SELECT status, COUNT(*) AS c FROM ${def.table} GROUP BY status`)
    .all() as { status: string; c: number }[];
  const count = (status: string) => rows.find((row) => row.status === status)?.c ?? 0;
  return {
    published: count("published"),
    draft: count("draft"),
    needs_review: count("needs_review"),
    total: rows.reduce((sum, row) => sum + row.c, 0),
  };
}

/** Album choices for the gallery photo editor. */
export function albumChoices() {
  return getDb()
    .prepare("SELECT id, title FROM gallery_albums ORDER BY order_index ASC, id ASC")
    .all() as { id: number; title: string }[];
}

/* ------------------------------------------------------------------ counts */

export function adminCounts() {
  const db = getDb();
  const one = (sql: string) => (db.prepare(sql).get() as { c: number }).c;
  return {
    inquiriesNew: one("SELECT COUNT(*) AS c FROM inquiries WHERE status = 'new'"),
    inquiriesTotal: one("SELECT COUNT(*) AS c FROM inquiries"),
    inquiriesAdmission: one("SELECT COUNT(*) AS c FROM inquiries WHERE type = 'admission'"),
    contentReview: one("SELECT COUNT(*) AS c FROM content WHERE status = 'needs_review'"),
    contentDraft: one("SELECT COUNT(*) AS c FROM content WHERE status = 'draft'"),
    testimonialsReview: one("SELECT COUNT(*) AS c FROM testimonials WHERE status = 'needs_review'"),
    faqsReview: one("SELECT COUNT(*) AS c FROM faqs WHERE status = 'needs_review'"),
    noticesPublished: one("SELECT COUNT(*) AS c FROM notices WHERE status = 'published'"),
    facultyPublished: one("SELECT COUNT(*) AS c FROM faculty WHERE status = 'published'"),
    materialsPublished: one("SELECT COUNT(*) AS c FROM materials WHERE status = 'published'"),
    albums: one("SELECT COUNT(*) AS c FROM gallery_albums"),
    photos: one("SELECT COUNT(*) AS c FROM gallery_photos"),
  };
}
