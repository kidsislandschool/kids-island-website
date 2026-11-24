import { getDb } from "./db";

/* -------------------------------------------------------------- testimonials */

export type PublicTestimonial = {
  id: number;
  quote: string;
  author_name: string;
  author_role: string | null;
};

export function getPublishedTestimonials(): PublicTestimonial[] {
  return getDb()
    .prepare(
      `SELECT id, quote, author_name, author_role FROM testimonials
       WHERE status = 'published' ORDER BY order_index ASC, id ASC`
    )
    .all() as PublicTestimonial[];
}

/* ------------------------------------------------------------------- notices */

export type PublicNotice = {
  id: number;
  title: string;
  summary: string | null;
  body: string | null;
  category: string;
  event_date: string | null;
  pinned: number;
  published_at: string | null;
  created_at: string;
  status: string;
  created_by: number | null;
};

export function getLatestNotices(limit = 3): PublicNotice[] {
  return getDb()
    .prepare(
      `SELECT * FROM notices WHERE status = 'published'
       ORDER BY pinned DESC, COALESCE(published_at, created_at) DESC LIMIT ?`
    )
    .all(limit) as PublicNotice[];
}

export function getNotices(opts: { search?: string; category?: string; page?: number; perPage?: number } = {}) {
  const db = getDb();
  const where: string[] = ["status = 'published'"];
  const params: unknown[] = [];
  if (opts.search) {
    where.push("(title LIKE ? OR summary LIKE ? OR body LIKE ?)");
    const q = `%${opts.search}%`;
    params.push(q, q, q);
  }
  if (opts.category && opts.category !== "All") {
    where.push("category = ?");
    params.push(opts.category);
  }
  const perPage = Math.min(opts.perPage ?? 9, 50);
  const page = Math.max(opts.page ?? 1, 1);
  const sqlWhere = `WHERE ${where.join(" AND ")}`;
  const rows = db
    .prepare(
      `SELECT * FROM notices ${sqlWhere}
       ORDER BY pinned DESC, COALESCE(published_at, created_at) DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, perPage, (page - 1) * perPage) as PublicNotice[];
  const total = (db.prepare(`SELECT COUNT(*) AS c FROM notices ${sqlWhere}`).get(...params) as { c: number }).c;
  return { rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export function getNotice(id: number): PublicNotice | undefined {
  return getDb().prepare("SELECT * FROM notices WHERE id = ? AND status = 'published'").get(id) as
    | PublicNotice
    | undefined;
}

export function getNoticeCategories(): string[] {
  const rows = getDb()
    .prepare("SELECT DISTINCT category FROM notices WHERE status = 'published' ORDER BY category")
    .all() as { category: string }[];
  return rows.map((r) => r.category);
}

/* ------------------------------------------------------------------- faculty */

export type PublicFaculty = {
  id: number;
  name: string;
  designation: string | null;
  subjects: string | null;
  qualification: string | null;
  bio: string | null;
  photo: string | null;
  featured: number;
  order_index: number;
};

export function getPublishedFaculty(): PublicFaculty[] {
  return getDb()
    .prepare(
      `SELECT id, name, designation, subjects, qualification, bio, photo, featured, order_index
       FROM faculty WHERE status = 'published' ORDER BY order_index ASC, name ASC`
    )
    .all() as PublicFaculty[];
}

/* ----------------------------------------------------------------- materials */

export type PublicMaterial = {
  id: number;
  title: string;
  class_level: string | null;
  subject: string | null;
  description: string | null;
  file_url: string | null;
  tags: string | null;
  published_at: string | null;
  created_at: string;
  status: string;
  created_by: number | null;
};

export function getMaterials(opts: {
  search?: string;
  classLevel?: string;
  subject?: string;
  page?: number;
  perPage?: number;
} = {}) {
  const db = getDb();
  const where: string[] = ["status = 'published'"];
  const params: unknown[] = [];
  if (opts.search) {
    where.push("(title LIKE ? OR description LIKE ? OR tags LIKE ?)");
    const q = `%${opts.search}%`;
    params.push(q, q, q);
  }
  if (opts.classLevel && opts.classLevel !== "All") {
    where.push("(class_level = ? OR class_level = 'All')");
    params.push(opts.classLevel);
  }
  if (opts.subject && opts.subject !== "All") {
    where.push("subject = ?");
    params.push(opts.subject);
  }
  const perPage = Math.min(opts.perPage ?? 9, 50);
  const page = Math.max(opts.page ?? 1, 1);
  const sqlWhere = `WHERE ${where.join(" AND ")}`;
  const rows = db
    .prepare(
      `SELECT * FROM materials ${sqlWhere}
       ORDER BY COALESCE(published_at, created_at) DESC LIMIT ? OFFSET ?`
    )
    .all(...params, perPage, (page - 1) * perPage) as PublicMaterial[];
  const total = (db.prepare(`SELECT COUNT(*) AS c FROM materials ${sqlWhere}`).get(...params) as { c: number }).c;
  const classLevels = (
    db.prepare("SELECT DISTINCT class_level AS v FROM materials WHERE status='published' AND class_level IS NOT NULL ORDER BY v").all() as { v: string }[]
  ).map((r) => r.v);
  const subjects = (
    db.prepare("SELECT DISTINCT subject AS v FROM materials WHERE status='published' AND subject IS NOT NULL ORDER BY v").all() as { v: string }[]
  ).map((r) => r.v);
  return { rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)), classLevels, subjects };
}

export function getPublishedMaterials(opts: { limit?: number } = {}): PublicMaterial[] {
  const limit = opts.limit ?? 6;
  return getDb()
    .prepare(
      `SELECT * FROM materials WHERE status = 'published'
       ORDER BY COALESCE(published_at, created_at) DESC LIMIT ?`
    )
    .all(limit) as PublicMaterial[];
}

/* ------------------------------------------------------------------- gallery */

export type PublicAlbum = {
  id: number;
  title: string;
  description: string | null;
  cover_photo: string | null;
  order_index: number;
  photos: { id: number; url: string; caption: string | null; alt: string }[];
};

export function getPublishedAlbums(withPhotos = true): PublicAlbum[] {
  const db = getDb();
  const albums = db
    .prepare("SELECT * FROM gallery_albums WHERE status = 'published' ORDER BY order_index ASC, id ASC")
    .all() as Omit<PublicAlbum, "photos">[];
  if (!withPhotos) return albums.map((a) => ({ ...a, photos: [] }));
  const photos = db
    .prepare(
      "SELECT id, album_id, url, caption, alt FROM gallery_photos WHERE status = 'published' ORDER BY order_index ASC, id ASC"
    )
    .all() as { id: number; album_id: number; url: string; caption: string | null; alt: string }[];
  return albums.map((album) => ({
    ...album,
    photos: photos.filter((p) => p.album_id === album.id),
  }));
}

export function getFeaturedGalleryPhotos(limit = 6) {
  return getDb()
    .prepare(
      `SELECT p.id, p.url, p.caption, p.alt, p.album_id, a.title AS album_title
       FROM gallery_photos p JOIN gallery_albums a ON a.id = p.album_id
       WHERE p.status = 'published' AND a.status = 'published'
       ORDER BY p.featured DESC, p.order_index ASC, p.id ASC LIMIT ?`
    )
    .all(limit) as {
    id: number;
    url: string;
    caption: string | null;
    alt: string;
    album_id: number;
    album_title: string;
  }[];
}

/* ---------------------------------------------------------------------- faqs */

export type PublicFaq = {
  id: number;
  question: string;
  answer: string;
  category: string;
};

export function getPublishedFaqs(category?: string): PublicFaq[] {
  const db = getDb();
  if (category && category !== "All") {
    return db
      .prepare(
        "SELECT id, question, answer, category FROM faqs WHERE status='published' AND category=? ORDER BY order_index ASC, id ASC"
      )
      .all(category) as PublicFaq[];
  }
  return db
    .prepare(
      "SELECT id, question, answer, category FROM faqs WHERE status='published' ORDER BY order_index ASC, id ASC"
    )
    .all() as PublicFaq[];
}

/* ------------------------------------------------------------------ inquiries */

export type Inquiry = {
  id: number;
  type: "admission" | "contact";
  name: string;
  parent_name: string | null;
  email: string | null;
  phone: string | null;
  class_apply: string | null;
  message: string | null;
  status: "new" | "read" | "replied" | "closed";
  ip: string | null;
  created_at: string;
  updated_at: string;
};

export function getInquiries(opts: {
  type?: "admission" | "contact";
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
} = {}) {
  const db = getDb();
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.type) {
    where.push("type = ?");
    params.push(opts.type);
  }
  if (opts.status && opts.status !== "all") {
    where.push("status = ?");
    params.push(opts.status);
  }
  if (opts.search) {
    where.push("(name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)");
    const q = `%${opts.search}%`;
    params.push(q, q, q, q);
  }
  const perPage = Math.min(opts.perPage ?? 20, 100);
  const page = Math.max(opts.page ?? 1, 1);
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM inquiries ${sqlWhere} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...params, perPage, (page - 1) * perPage) as Inquiry[];
  const total = (db.prepare(`SELECT COUNT(*) AS c FROM inquiries ${sqlWhere}`).get(...params) as { c: number }).c;
  return { rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export function getInquiry(id: number): Inquiry | undefined {
  return getDb().prepare("SELECT * FROM inquiries WHERE id = ?").get(id) as Inquiry | undefined;
}

export function inquiryCounts() {
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) AS c FROM inquiries").get() as { c: number }).c;
  const newCount = (db.prepare("SELECT COUNT(*) AS c FROM inquiries WHERE status='new'").get() as { c: number }).c;
  const admission = (db.prepare("SELECT COUNT(*) AS c FROM inquiries WHERE type='admission'").get() as { c: number }).c;
  return { total, new: newCount, admission };
}

/* ------------------------------------------------------------ staff notices */

export function getStaffNotices(opts: {
  staffId: number;
  status?: string;
  page?: number;
  perPage?: number;
}) {
  const db = getDb();
  const where: string[] = ["created_by = ?"];
  const params: unknown[] = [opts.staffId];
  if (opts.status && opts.status !== "all") {
    where.push("status = ?");
    params.push(opts.status);
  }
  const perPage = Math.min(opts.perPage ?? 20, 100);
  const page = Math.max(opts.page ?? 1, 1);
  const sqlWhere = `WHERE ${where.join(" AND ")}`;
  const rows = db
    .prepare(`SELECT * FROM notices ${sqlWhere} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, perPage, (page - 1) * perPage) as PublicNotice[];
  const total = (db.prepare(`SELECT COUNT(*) AS c FROM notices ${sqlWhere}`).get(...params) as { c: number }).c;
  return { rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

/* ---------------------------------------------------------- staff materials */

export function getStaffMaterials(opts: {
  staffId: number;
  status?: string;
  page?: number;
  perPage?: number;
}) {
  const db = getDb();
  const where: string[] = ["created_by = ?"];
  const params: unknown[] = [opts.staffId];
  if (opts.status && opts.status !== "all") {
    where.push("status = ?");
    params.push(opts.status);
  }
  const perPage = Math.min(opts.perPage ?? 20, 100);
  const page = Math.max(opts.page ?? 1, 1);
  const sqlWhere = `WHERE ${where.join(" AND ")}`;
  const rows = db
    .prepare(`SELECT * FROM materials ${sqlWhere} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, perPage, (page - 1) * perPage) as PublicMaterial[];
  const total = (db.prepare(`SELECT COUNT(*) AS c FROM materials ${sqlWhere}`).get(...params) as { c: number }).c;
  return { rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}
