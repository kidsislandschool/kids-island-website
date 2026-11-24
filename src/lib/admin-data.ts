import { supabaseAdmin } from "./supabase";
import { COLLECTIONS, allowedColumns, type CollectionDef } from "./collections";

export type AdminRow = Record<string, unknown> & { id: number };

/** Validate collection key, returning its definition. */
export function getCollectionDef(key: string): CollectionDef | undefined {
  return COLLECTIONS[key];
}

export async function getCollectionRows(
  key: string,
  opts: { search?: string; status?: string; page?: number; perPage?: number } = {}
) {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  
  let query = supabaseAdmin.from(def.table).select('*', { count: 'exact' });
  
  if (opts.status && opts.status !== "all") {
    if (opts.status === "needs_review" || opts.status === "published" || opts.status === "draft") {
      query = query.eq('status', opts.status);
    }
  }
  
  const searchFields = def.fields.filter((f) => f.searchable).map((f) => f.name);
  if (opts.search && searchFields.length) {
    const orFilters = searchFields.map((f) => `${f}.ilike.%${opts.search}%`).join(',');
    query = query.or(orFilters);
  }
  
  query = query.order('created_at', { ascending: false, nullsFirst: false });
  
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 20;
  query = query.range((page - 1) * perPage, page * perPage - 1);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return {
    rows: (data || []) as AdminRow[],
    total: count ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((count ?? 0) / perPage),
  };
}

export async function getCollectionRow(key: string, id: number): Promise<AdminRow | undefined> {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  
  const { data, error } = await supabaseAdmin
    .from(def.table)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return undefined;
  return data as AdminRow;
}

export async function createCollectionRow(
  key: string,
  input: Record<string, unknown>
): Promise<AdminRow> {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  
  const allowed = allowedColumns(def, input);
  const { data, error } = await supabaseAdmin
    .from(def.table)
    .insert(allowed)
    .select()
    .single();
  
  if (error) throw error;
  return data as AdminRow;
}

export async function updateCollectionRow(
  key: string,
  id: number,
  input: Record<string, unknown>
): Promise<AdminRow> {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  
  const allowed = allowedColumns(def, input);
  const { data, error } = await supabaseAdmin
    .from(def.table)
    .update({ ...allowed, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as AdminRow;
}

export async function deleteCollectionRow(key: string, id: number): Promise<void> {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  
  const { error } = await supabaseAdmin
    .from(def.table)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function bulkUpdateStatus(
  key: string,
  ids: number[],
  status: "published" | "draft" | "needs_review"
): Promise<number> {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  
  const { error, count } = await supabaseAdmin
    .from(def.table)
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids);
  
  if (error) throw error;
  return count ?? 0;
}

/* ------------------------------------------------------------------ counts */

export async function adminCounts() {
  const [
    { count: inquiriesNew },
    { count: inquiriesTotal },
    { count: inquiriesAdmission },
    { count: contentReview },
    { count: contentDraft },
    { count: testimonialsReview },
    { count: faqsReview },
    { count: noticesPublished },
    { count: facultyPublished },
    { count: materialsPublished },
    { count: albums },
    { count: photos },
  ] = await Promise.all([
    supabaseAdmin.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabaseAdmin.from('inquiries').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('inquiries').select('*', { count: 'exact', head: true }).eq('type', 'admission'),
    supabaseAdmin.from('content').select('*', { count: 'exact', head: true }).eq('status', 'needs_review'),
    supabaseAdmin.from('content').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabaseAdmin.from('testimonials').select('*', { count: 'exact', head: true }).eq('status', 'needs_review'),
    supabaseAdmin.from('faqs').select('*', { count: 'exact', head: true }).eq('status', 'needs_review'),
    supabaseAdmin.from('notices').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('faculty').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('albums').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('album_images').select('*', { count: 'exact', head: true }),
  ]);
  
  return {
    inquiriesNew: inquiriesNew ?? 0,
    inquiriesTotal: inquiriesTotal ?? 0,
    inquiriesAdmission: inquiriesAdmission ?? 0,
    contentReview: contentReview ?? 0,
    contentDraft: contentDraft ?? 0,
    testimonialsReview: testimonialsReview ?? 0,
    faqsReview: faqsReview ?? 0,
    noticesPublished: noticesPublished ?? 0,
    facultyPublished: facultyPublished ?? 0,
    materialsPublished: materialsPublished ?? 0,
    albums: albums ?? 0,
    photos: photos ?? 0,
  };
}

/** Get status counts for a collection (published, draft, needs_review). */
export async function getCollectionStatusCounts(key: string): Promise<{ published: number; draft: number; needs_review: number; total: number }> {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  
  const [{ count: published }, { count: draft }, { count: needs_review }] = await Promise.all([
    supabaseAdmin.from(def.table).select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from(def.table).select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabaseAdmin.from(def.table).select('*', { count: 'exact', head: true }).eq('status', 'needs_review'),
  ]);
  
  const total = (published ?? 0) + (draft ?? 0) + (needs_review ?? 0);
  return { published: published ?? 0, draft: draft ?? 0, needs_review: needs_review ?? 0, total };
}

/** Get album choices for dropdowns (id, title). */
export async function albumChoices(): Promise<{ id: number; title: string }[]> {
  const { data, error } = await supabaseAdmin
    .from('albums')
    .select('id, title')
    .eq('status', 'published')
    .order('title', { ascending: true });
  
  if (error) return [];
  return (data || []) as { id: number; title: string }[];
}