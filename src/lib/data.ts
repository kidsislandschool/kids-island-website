import { supabaseAdmin, supabase } from './supabase';

/* -------------------------------------------------------------- testimonials */

export type PublicTestimonial = {
  id: number;
  quote: string;
  author_name: string;
  author_role: string | null;
};

export async function getPublishedTestimonials(): Promise<PublicTestimonial[]> {
  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .select('id, quote, author_name, author_role')
    .eq('status', 'published')
    .order('order_index', { ascending: true })
    .order('id', { ascending: true });
  
  if (error) {
    console.error('getPublishedTestimonials error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getPublishedTestimonials: data is not an array:', data);
    return [];
  }
  return data as PublicTestimonial[];
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

export async function getLatestNotices(limit = 3): Promise<PublicNotice[]> {
  const { data, error } = await supabaseAdmin
    .from('notices')
    .select('*')
    .eq('status', 'published')
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('getLatestNotices error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getLatestNotices: data is not an array:', data);
    return [];
  }
  return data as PublicNotice[];
}

export async function getNotices(opts: { search?: string; category?: string; page?: number; perPage?: number } = {}) {
  const { search, category, page = 1, perPage = 10 } = opts;
  
  let query = supabaseAdmin
    .from('notices')
    .select('*', { count: 'exact' })
    .eq('status', 'published');
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,body.ilike.%${search}%`);
  }
  if (category) {
    query = query.eq('category', category);
  }
  
  query = query
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error('getNotices error:', error);
    return { rows: [], page: 1, pages: 0, total: 0 };
  }
  if (!Array.isArray(data)) {
    console.error('getNotices: data is not an array:', data);
    return { rows: [], page: 1, pages: 0, total: 0 };
  }
  
  return {
    rows: data as PublicNotice[],
    page,
    pages: Math.ceil((count ?? 0) / perPage),
    total: count ?? 0,
  };
}

export async function getNotice(id: number): Promise<PublicNotice | undefined> {
  const { data, error } = await supabaseAdmin
    .from('notices')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();
  
  if (error || !data) return undefined;
  return data as PublicNotice;
}

// Simple in-memory cache for categories (categories don't change often)
let noticeCategoriesCache: { data: string[]; timestamp: number } | null = null;
const CATEGORIES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getNoticeCategories(): Promise<string[]> {
  // Check cache first
  if (noticeCategoriesCache && Date.now() - noticeCategoriesCache.timestamp < CATEGORIES_CACHE_TTL) {
    return noticeCategoriesCache.data;
  }
  
  const { data, error } = await supabaseAdmin
    .from('notices')
    .select('category')
    .eq('status', 'published');
  
  if (error) {
    console.error('getNoticeCategories error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getNoticeCategories: data is not an array:', data);
    return [];
  }
  
  // Use a more efficient approach - just get unique categories
  const categories = [...new Set(data.map((n: { category: string }) => n.category))].sort();
  
  // Update cache
  noticeCategoriesCache = { data: categories, timestamp: Date.now() };
  
  return categories;
}

/* --------------------------------------------------------------------- materials */

export type PublicMaterial = {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  class_level: string;
  subject: string;
  file_type: string | null;
  file_size: number | null;
  published_at: string | null;
  created_at: string;
  status: string;
  created_by: number | null;
};

// Simple in-memory cache for materials filters (filters don't change often)
let materialsFiltersCache: { classLevels: string[]; subjects: string[]; timestamp: number } | null = null;
const FILTERS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getMaterials(opts: { search?: string; classLevel?: string; subject?: string; page?: number; perPage?: number } = {}) {
  const { search, classLevel, subject, page = 1, perPage = 12 } = opts;
  
  let query = supabaseAdmin
    .from('materials')
    .select('*', { count: 'exact' })
    .eq('status', 'published');
  
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (classLevel) {
    query = query.eq('class_level', classLevel);
  }
  if (subject) {
    query = query.eq('subject', subject);
  }
  
  query = query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  
  const [mainResult, filterResult] = await Promise.all([
    query,
    supabaseAdmin
      .from('materials')
      .select('class_level, subject')
      .eq('status', 'published'),
  ]);
  
  const { data, error, count } = mainResult;
  const { data: filterData, error: filterError } = filterResult;
  
  if (error) {
    console.error('getMaterials error:', error);
    return { rows: [], page: 1, pages: 0, total: 0, classLevels: [], subjects: [] };
  }
  if (!Array.isArray(data)) {
    console.error('getMaterials: data is not an array:', data);
    return { rows: [], page: 1, pages: 0, total: 0, classLevels: [], subjects: [] };
  }
  
  // Check cache for filters first
  let classLevels: string[];
  let subjects: string[];
  
  if (materialsFiltersCache && Date.now() - materialsFiltersCache.timestamp < FILTERS_CACHE_TTL) {
    classLevels = materialsFiltersCache.classLevels;
    subjects = materialsFiltersCache.subjects;
  } else {
    // Extract distinct class levels and subjects from filter data
    const classLevelsSet = new Set<string>();
    const subjectsSet = new Set<string>();
    
    if (Array.isArray(filterData)) {
      filterData.forEach((m: { class_level: string; subject: string }) => {
        if (m.class_level) classLevelsSet.add(m.class_level);
        if (m.subject) subjectsSet.add(m.subject);
      });
    }
    
    classLevels = Array.from(classLevelsSet).sort();
    subjects = Array.from(subjectsSet).sort();
    
    // Update cache
    materialsFiltersCache = { classLevels, subjects, timestamp: Date.now() };
  }
  
  return {
    rows: data as PublicMaterial[],
    page,
    pages: Math.ceil((count ?? 0) / perPage),
    total: count ?? 0,
    classLevels,
    subjects,
  };
}

export async function getMaterial(id: number): Promise<PublicMaterial | undefined> {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();
  
  if (error || !data) return undefined;
  return data as PublicMaterial;
}

export async function getMaterialClassLevels(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .select('class_level')
    .eq('status', 'published');
  
  if (error) {
    console.error('getMaterialClassLevels error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getMaterialClassLevels: data is not an array:', data);
    return [];
  }
  
  const classLevels = new Set<string>();
  data.forEach((m: { class_level: string }) => classLevels.add(m.class_level));
  return Array.from(classLevels).sort();
}

export async function getMaterialSubjects(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .select('subject')
    .eq('status', 'published');
  
  if (error) {
    console.error('getMaterialSubjects error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getMaterialSubjects: data is not an array:', data);
    return [];
  }
  
  const subjects = new Set<string>();
  data.forEach((m: { subject: string }) => subjects.add(m.subject));
  return Array.from(subjects).sort();
}

/* -------------------------------------------------------------------- faqs */

export type PublicFAQ = {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  status: string;
};

export async function getPublishedFaqs(): Promise<PublicFAQ[]> {
  try {
    // Try with sort_order first, fall back to id if column doesn't exist
    const { data, error } = await supabaseAdmin
      .from('faqs')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });
    
    if (error) {
      // If sort_order column doesn't exist, try without it
      if (error.code === '42703' && error.message.includes('sort_order')) {
        console.warn('getPublishedFaqs: sort_order column not found, falling back to id');
        const { data: data2, error: error2 } = await supabaseAdmin
          .from('faqs')
          .select('*')
          .eq('status', 'published')
          .order('id', { ascending: true });
        
        if (error2) {
          console.error('getPublishedFaqs fallback error:', error2);
          return [];
        }
        if (!Array.isArray(data2)) {
          console.error('getPublishedFaqs fallback: data is not an array:', data2);
          return [];
        }
        return data2 as PublicFAQ[];
      }
      
      console.error('getPublishedFaqs error:', error);
      return [];
    }
    if (!Array.isArray(data)) {
      console.error('getPublishedFaqs: data is not an array:', data);
      return [];
    }
    return data as PublicFAQ[];
  } catch (err) {
    console.error('getPublishedFaqs exception:', err);
    return [];
  }
}

export async function getFAQCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('faqs')
      .select('category')
      .eq('status', 'published');
    
    if (error) {
      console.error('getFAQCategories error:', error);
      return [];
    }
    if (!Array.isArray(data)) {
      console.error('getFAQCategories: data is not an array:', data);
      return [];
    }
    
    const categories = new Set<string>();
    data.forEach((f: { category: string }) => categories.add(f.category));
    return Array.from(categories).sort();
  } catch (err) {
    console.error('getFAQCategories exception:', err);
    return [];
  }
}

/* ---------------------------------------------------------------- albums */

export type PublicAlbum = {
  id: number;
  title: string;
  description: string | null;
  cover_url: string;
  sort_order: number;
  status: string;
};

export async function getPublishedAlbums(): Promise<PublicAlbum[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('albums')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });
    
    if (error) {
      console.error('getPublishedAlbums error:', error);
      return [];
    }
    if (!Array.isArray(data)) {
      console.error('getPublishedAlbums: data is not an array:', data);
      return [];
    }
    return data as PublicAlbum[];
  } catch (err) {
    console.error('getPublishedAlbums exception:', err);
    return [];
  }
}

export type PublicAlbumImage = {
  id: number;
  album_id: number;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

export async function getAlbumImages(albumId: number): Promise<PublicAlbumImage[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('album_images')
      .select('*')
      .eq('album_id', albumId)
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('getAlbumImages error:', error);
      return [];
    }
    if (!Array.isArray(data)) {
      console.error('getAlbumImages: data is not an array:', data);
      return [];
    }
    return data as PublicAlbumImage[];
  } catch (err) {
    console.error('getAlbumImages exception:', err);
    return [];
  }
}

export async function getAlbum(albumId: number): Promise<PublicAlbum | undefined> {
  try {
    const { data, error } = await supabaseAdmin
      .from('albums')
      .select('*')
      .eq('id', albumId)
      .eq('status', 'published')
      .single();
    
    if (error || !data) return undefined;
    return data as PublicAlbum;
  } catch (err) {
    console.error('getAlbum exception:', err);
    return undefined;
  }
}

/* ---------------------------------------------------------------- faculty */

export type PublicFaculty = {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  department: string;
  sort_order: number;
  status: string;
};

export async function getPublishedFaculty(): Promise<PublicFaculty[]> {
  try {
    // Try with sort_order first, fall back to id if column doesn't exist
    const { data, error } = await supabaseAdmin
      .from('faculty')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });
    
    if (error) {
      // If sort_order column doesn't exist, try without it
      if (error.code === '42703' && error.message.includes('sort_order')) {
        console.warn('getPublishedFaculty: sort_order column not found, falling back to id');
        const { data: data2, error: error2 } = await supabaseAdmin
          .from('faculty')
          .select('*')
          .eq('status', 'published')
          .order('id', { ascending: true });
        
        if (error2) {
          console.error('getPublishedFaculty fallback error:', error2);
          return [];
        }
        if (!Array.isArray(data2)) {
          console.error('getPublishedFaculty fallback: data is not an array:', data2);
          return [];
        }
        return data2 as PublicFaculty[];
      }
      
      console.error('getPublishedFaculty error:', error);
      return [];
    }
    if (!Array.isArray(data)) {
      console.error('getPublishedFaculty: data is not an array:', data);
      return [];
    }
    return data as PublicFaculty[];
  } catch (err) {
    console.error('getPublishedFaculty exception:', err);
    return [];
  }
}

export async function getFacultyDepartments(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('faculty')
    .select('department')
    .eq('status', 'published');
  
  if (error) {
    console.error('getFacultyDepartments error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getFacultyDepartments: data is not an array:', data);
    return [];
  }
  
  const departments = new Set<string>();
  data.forEach((f: { department: string }) => departments.add(f.department));
  return Array.from(departments).sort();
}

/* ------------------------------------------------------------------- inquiries */

export type PublicInquiry = {
  id: number;
  student_name: string;
  parent_name: string;
  phone: string;
  email: string;
  class_applying: string;
  message: string | null;
  status: string;
  created_at: string;
  viewed_at: string | null;
  viewed_by: number | null;
};

export async function createInquiry(data: Omit<PublicInquiry, 'id' | 'status' | 'created_at' | 'viewed_at' | 'viewed_by'>): Promise<PublicInquiry> {
  const { data: inquiry, error } = await supabaseAdmin
    .from('inquiries')
    .insert({ ...data, status: 'new', created_at: new Date().toISOString() })
    .select()
    .single();
  
  if (error) throw error;
  return inquiry as PublicInquiry;
}

export async function getInquiries(opts: { page?: number; perPage?: number; status?: string } = {}): Promise<{ inquiries: PublicInquiry[]; total: number; totalPages: number }> {
  const { page = 1, perPage = 20, status } = opts;
  
  let query = supabaseAdmin
    .from('inquiries')
    .select('*', { count: 'exact' });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error('getInquiries error:', error);
    return { inquiries: [], total: 0, totalPages: 0 };
  }
  if (!Array.isArray(data)) {
    console.error('getInquiries: data is not an array:', data);
    return { inquiries: [], total: 0, totalPages: 0 };
  }
  
  return {
    inquiries: data as PublicInquiry[],
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / perPage),
  };
}

export async function getInquiry(id: number): Promise<PublicInquiry | undefined> {
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return undefined;
  return data as PublicInquiry;
}

export async function updateInquiryStatus(id: number, status: PublicInquiry['status']): Promise<void> {
  const { error } = await supabaseAdmin
    .from('inquiries')
    .update({ status, viewed_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
}

export async function inquiryCounts(): Promise<{ new: number; contacted: number; enrolled: number; closed: number }> {
  const [{ count: newCount }, { count: contactedCount }, { count: enrolledCount }, { count: closedCount }] = await Promise.all([
    supabaseAdmin.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabaseAdmin.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'contacted'),
    supabaseAdmin.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'enrolled'),
    supabaseAdmin.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
  ]);
  
  return {
    new: newCount ?? 0,
    contacted: contactedCount ?? 0,
    enrolled: enrolledCount ?? 0,
    closed: closedCount ?? 0,
  };
}

export type StaffMaterial = {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  class_level: string;
  subject: string;
  file_type: string | null;
  file_size: number | null;
  status: string;
  created_at: string;
  created_by: number | null;
};

export async function getStaffMaterials(opts: { page?: number; perPage?: number; status?: string } = {}): Promise<{ materials: StaffMaterial[]; total: number; totalPages: number }> {
  const { page = 1, perPage = 20, status } = opts;
  
  let query = supabaseAdmin
    .from('materials')
    .select('*', { count: 'exact' });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error('getStaffMaterials error:', error);
    return { materials: [], total: 0, totalPages: 0 };
  }
  if (!Array.isArray(data)) {
    console.error('getStaffMaterials: data is not an array:', data);
    return { materials: [], total: 0, totalPages: 0 };
  }
  
  return {
    materials: data as StaffMaterial[],
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / perPage),
  };
}

export async function getPublishedMaterials(): Promise<StaffMaterial[]> {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('getPublishedMaterials error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getPublishedMaterials: data is not an array:', data);
    return [];
  }
  return data as StaffMaterial[];
}