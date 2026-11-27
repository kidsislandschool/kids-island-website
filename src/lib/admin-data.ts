import { supabaseAdmin } from "./supabase";
import { COLLECTIONS, pickWritableColumns, type CollectionDef } from "./collections";

export type AdminRow = Record<string, unknown> & { id: number };

/** Validate collection key, returning its definition. */
export function getCollectionDef(key: string): CollectionDef | undefined {
  return COLLECTIONS[key];
}

export async function getCollectionRows(
  key: string,
  opts: {
    search?: string;
    status?: string;
    page?: number;
    perPage?: number;
    /** Exact-match filters keyed by column name (e.g. class / section). */
    filters?: Record<string, string | undefined>;
  } = {}
) {
  const def = getCollectionDef(key);
  if (!def) throw new Error("Unknown collection");
  
  let query = supabaseAdmin.from(def.table).select('*', { count: 'exact' });

  for (const [column, value] of Object.entries(opts.filters ?? {})) {
    if (!value || value === "all") continue;
    // Only filter on columns the collection actually exposes.
    if (!def.fields.some((f) => f.name === column)) continue;
    query = query.eq(column, value);
  }
  
  if (opts.status && opts.status !== "all") {
    if (opts.status === "needs_review" || opts.status === "published" || opts.status === "draft") {
      query = query.eq('status', opts.status);
    }
  }
  
  const searchFields = def.fields.filter((f) => f.searchable).map((f) => f.name);
  if (opts.search && searchFields.length) {
    // PostgREST `or` values must not contain commas/parentheses from user input.
    const safe = opts.search.replace(/[%,()]/g, " ").trim();
    if (safe) {
      const orFilters = searchFields.map((f) => `${f}.ilike.%${safe}%`).join(",");
      query = query.or(orFilters);
    }
  }

  if (def.sort?.length) {
    for (const s of def.sort) {
      query = query.order(s.column, {
        ascending: s.ascending ?? true,
        nullsFirst: s.nullsFirst ?? false,
      });
    }
  } else {
    query = query.order("created_at", { ascending: false, nullsFirst: false });
  }
  
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
  
  const allowed = pickWritableColumns(def, input);
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
  
  const allowed = pickWritableColumns(def, input);
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
    { count: redFlagsActive },
    { count: redFlagsResolved },
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
    supabaseAdmin.from('gallery_albums').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('gallery_photos').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('red_flags').select('*', { count: 'exact', head: true }).eq('resolved', false),
    supabaseAdmin.from('red_flags').select('*', { count: 'exact', head: true }).eq('resolved', true),
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
    redFlags: {
      active: redFlagsActive ?? 0,
      resolved: redFlagsResolved ?? 0,
      total: (redFlagsActive ?? 0) + (redFlagsResolved ?? 0),
    },
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
    .from('gallery_albums')
    .select('id, title')
    .order('title', { ascending: true });
  
  if (error) return [];
  return (data || []) as { id: number; title: string }[];
}

/* --------------------------------------------------------------- inquiries */

export type AdminInquiry = {
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

export async function getAdminInquiries(
  opts: { page?: number; perPage?: number; status?: string; type?: string; search?: string } = {}
): Promise<{ rows: AdminInquiry[]; total: number; page: number; pages: number }> {
  const page = Math.max(opts.page ?? 1, 1);
  const perPage = Math.min(opts.perPage ?? 20, 100);

  let query = supabaseAdmin.from("inquiries").select("*", { count: "exact" });

  if (opts.type === "admission" || opts.type === "contact") {
    query = query.eq("type", opts.type);
  }
  if (opts.status && ["new", "read", "replied", "closed"].includes(opts.status)) {
    query = query.eq("status", opts.status);
  }
  const search = opts.search?.replace(/[%,()]/g, " ").trim();
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,message.ilike.%${search}%`
    );
  }

  query = query
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("getAdminInquiries error:", error);
    return { rows: [], total: 0, page, pages: 1 };
  }

  const total = count ?? 0;
  return {
    rows: (data || []) as AdminInquiry[],
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getAdminInquiry(id: number): Promise<AdminInquiry | undefined> {
  const { data, error } = await supabaseAdmin.from("inquiries").select("*").eq("id", id).single();
  if (error || !data) return undefined;
  return data as AdminInquiry;
}

export async function adminInquiryCounts(): Promise<{
  total: number;
  admission: number;
  contact: number;
  new: number;
  replied: number;
}> {
  const base = () => supabaseAdmin.from("inquiries").select("*", { count: "exact", head: true });
  const [
    { count: total },
    { count: admission },
    { count: contact },
    { count: newCount },
    { count: replied },
  ] = await Promise.all([
    base(),
    base().eq("type", "admission"),
    base().eq("type", "contact"),
    base().eq("status", "new"),
    base().eq("status", "replied"),
  ]);

  return {
    total: total ?? 0,
    admission: admission ?? 0,
    contact: contact ?? 0,
    new: newCount ?? 0,
    replied: replied ?? 0,
  };
}

export async function getRedFlagCount(): Promise<{
  active: number;
  resolved: number;
  total: number;
}> {
  const [
    { count: active },
    { count: resolved },
  ] = await Promise.all([
    supabaseAdmin.from("red_flags").select("*", { count: "exact", head: true }).eq("resolved", false),
    supabaseAdmin.from("red_flags").select("*", { count: "exact", head: true }).eq("resolved", true),
  ]);

  return {
    active: active ?? 0,
    resolved: resolved ?? 0,
    total: (active ?? 0) + (resolved ?? 0),
  };
}

export async function getStudentCount(): Promise<number> {
  const { count } = await supabaseAdmin
    .from("students")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function getPendingStaffCount(): Promise<number> {
  const { count } = await supabaseAdmin
    .from("staff")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}