import { supabaseAdmin, supabase } from './supabase';

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
export async function getContent<T>(key: string, fallback: T, opts?: { publicOnly?: boolean }): Promise<T> {
  const client = supabaseAdmin;
  const { data: row, error } = await client
    .from('content')
    .select('*')
    .eq('key', key)
    .single();
  
  if (error || !row) return fallback;
  
  const publicOnly = opts?.publicOnly ?? true;
  if (publicOnly && row.status !== "published") return fallback;
  
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

/** Read raw record (including status) — used by the admin. */
export async function getContentRecord(key: string): Promise<ContentRecord | undefined> {
  const client = supabaseAdmin;
  const { data: row, error } = await client
    .from('content')
    .select('*')
    .eq('key', key)
    .single();
  
  if (error || !row) return undefined;
  return row as ContentRecord;
}

export async function listContent(prefix?: string): Promise<ContentRecord[]> {
  const client = supabaseAdmin;
  let query = client.from('content').select('*').order('key');
  
  if (prefix) {
    query = query.like('key', `${prefix}%`);
  }
  
  const { data, error } = await query;
  if (error) return [];
  return (data || []) as ContentRecord[];
}

export async function setContent(
  key: string,
  value: unknown,
  status: ContentStatus,
  userId?: number | null
): Promise<void> {
  const client = supabaseAdmin;
  const { error } = await client
    .from('content')
    .upsert({
      key,
      value: JSON.stringify(value),
      status,
      updated_at: new Date().toISOString(),
      updated_by: userId ?? null,
    }, { onConflict: 'key' });
  
  if (error) throw error;
}

/** Count content blocks waiting for review (drives the admin badge). */
export async function countNeedsReview(): Promise<{ content: number; testimonials: number; faqs: number }> {
  const client = supabaseAdmin;
  
  const [{ count: c }, { count: t }, { count: f }] = await Promise.all([
    client.from('content').select('*', { count: 'exact', head: true }).eq('status', 'needs_review'),
    client.from('testimonials').select('*', { count: 'exact', head: true }).eq('status', 'needs_review'),
    client.from('faqs').select('*', { count: 'exact', head: true }).eq('status', 'needs_review'),
  ]);
  
  return { content: c ?? 0, testimonials: t ?? 0, faqs: f ?? 0 };
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
export async function getSeo(path: string, fallback: PageSeo): Promise<PageSeo> {
  const all = await getContent<Record<string, PageSeo>>("settings.seo", {});
  const entry = all[path];
  return entry?.title ? entry : fallback;
}

export async function getNav() {
  return getContent<{
    links: { label: string; href: string }[];
    cta: { label: string; href: string };
  }>("settings.nav", {
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Admissions", href: "/admissions" },
      { label: "Academics", href: "/academics" },
      { label: "Faculty", href: "/faculty" },
      { label: "Gallery", href: "/gallery" },
      { label: "Notices", href: "/notices" },
      { label: "Study Materials", href: "/study-materials" },
      { label: "Contact", href: "/contact" },
    ],
    cta: { label: "Apply for Admission", href: "/admissions#inquiry" },
  });
}

export async function getFooter() {
  return getContent<{
    blurb: string;
    quickLinks: { label: string; href: string }[];
    resources: { label: string; href: string }[];
    legal: { label: string; href: string }[];
    copyright: string;
  }>("settings.footer", {
    blurb: "Kids Island Senior Secondary School is committed to providing quality education in a nurturing environment. We believe every child deserves the opportunity to learn, grow, and succeed.",
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Admissions", href: "/admissions" },
      { label: "Academics", href: "/academics" },
      { label: "Faculty", href: "/faculty" },
      { label: "Contact", href: "/contact" },
    ],
    resources: [
      { label: "Gallery", href: "/gallery" },
      { label: "Notices", href: "/notices" },
      { label: "Study Materials", href: "/study-materials" },
      { label: "FAQs", href: "/contact#faqs" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
    copyright: "Kids Island Senior Secondary School, Aligarh.",
  });
}

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

export async function getSiteSettings(): Promise<SiteSettings> {
  return getContent<SiteSettings>("settings.site", {
    name: "Kids Island Senior Secondary School",
    shortName: "Kids Island",
    tagline: "Shaping bright futures through quality education",
    location: "Aligarh, Uttar Pradesh, India — 202001",
    phone: "+91 9012655655",
    email: "contact@kidsaligarh.com",
    whatsapp: "+91 9997973574",
    whatsappNote: "",
    hoursPhone: "Mon–Sat: 8:00 AM – 4:00 PM",
    hoursOffice: "Mon–Fri: 9:00 AM – 3:00 PM",
    logoText: "Kids Island",
    socials: [
      { label: "Facebook", url: "https://facebook.com/kidsislandaligarh" },
      { label: "Instagram", url: "https://instagram.com/kidsislandaligarh" },
      { label: "YouTube", url: "https://youtube.com/@kidsislandaligarh" },
    ],
    affiliation: "",
  });
}

export async function getAffiliation(): Promise<string> {
  return getContent<string>("settings.affiliation", "");
}

export type Testimonial = {
  id: number;
  quote: string;
  author_name: string;
  author_role: string;
  image_url?: string;
  status: ContentStatus;
};

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const client = supabaseAdmin;
  const { data, error } = await client
    .from('testimonials')
    .select('*')
    .eq('status', 'published')
    .order('id', { ascending: false });
  
  if (error) {
    console.error('getPublishedTestimonials error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getPublishedTestimonials: data is not an array:', data);
    return [];
  }
  return data as Testimonial[];
}

export type FAQ = {
  id: number;
  question: string;
  answer: string;
  category: string;
  status: ContentStatus;
};

export async function getPublishedFaqs(): Promise<FAQ[]> {
  const client = supabaseAdmin;
  const { data, error } = await client
    .from('faqs')
    .select('*')
    .eq('status', 'published')
    .order('id', { ascending: true });
  
  if (error) {
    console.error('getPublishedFaqs error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getPublishedFaqs: data is not an array:', data);
    return [];
  }
  return data as FAQ[];
}

export type Album = {
  id: number;
  title: string;
  description: string | null;
  cover_url: string;
  status: ContentStatus;
  photos: AlbumPhoto[];
};

export type AlbumPhoto = {
  id: number;
  url: string;
  caption: string | null;
  alt: string;
  sort_order: number;
};

export async function getPublishedAlbums(): Promise<Album[]> {
  const client = supabaseAdmin;
  const { data, error } = await client
    .from('gallery_albums')
    .select('*')
    .eq('status', 'published')
    .order('order_index', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.error('getPublishedAlbums error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getPublishedAlbums: data is not an array:', data);
    return [];
  }
  if (data.length === 0) return [];

  const albumIds = data.map((album) => album.id);
  const { data: photosData, error: photosError } = await client
    .from('gallery_photos')
    .select('*')
    .in('album_id', albumIds)
    .eq('status', 'published')
    .order('order_index', { ascending: true })
    .order('id', { ascending: true });

  if (photosError) {
    console.error('getPublishedAlbums photos error:', photosError);
  }

  const photos = Array.isArray(photosData) ? photosData : [];

  return data.map((album) => {
    const albumPhotos: AlbumPhoto[] = photos
      .filter((photo) => photo.album_id === album.id)
      .map((photo) => ({
        id: photo.id,
        url: photo.url,
        caption: photo.caption ?? null,
        alt: photo.alt || album.title,
        sort_order: photo.order_index ?? 0,
      }));

    return {
      id: album.id,
      title: album.title,
      description: album.description ?? null,
      cover_url: album.cover_photo || albumPhotos[0]?.url || '',
      status: album.status as ContentStatus,
      photos: albumPhotos,
    };
  });
}

export type AlbumImage = {
  id: number;
  album_id: number;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

export async function getAlbumImages(albumId: number): Promise<AlbumImage[]> {
  const client = supabaseAdmin;
  const { data, error } = await client
    .from('gallery_photos')
    .select('*')
    .eq('album_id', albumId)
    .eq('status', 'published')
    .order('order_index', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.error('getAlbumImages error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getAlbumImages: data is not an array:', data);
    return [];
  }
  return data.map((photo) => ({
    id: photo.id,
    album_id: photo.album_id,
    image_url: photo.url,
    caption: photo.caption ?? null,
    sort_order: photo.order_index ?? 0,
  }));
}

export type FacultyMember = {
  id: number;
  name: string;
  role: string;
  bio: string;
  image_url?: string;
  department: string;
  status: ContentStatus;
};

export async function getPublishedFaculty(): Promise<FacultyMember[]> {
  const client = supabaseAdmin;
  const { data, error } = await client
    .from('faculty')
    .select('*')
    .eq('status', 'published')
    .order('id', { ascending: true });
  
  if (error) {
    console.error('getPublishedFaculty error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getPublishedFaculty: data is not an array:', data);
    return [];
  }
  return data as FacultyMember[];
}

export type Notice = {
  id: number;
  title: string;
  summary: string;
  body: string;
  category: string;
  event_date?: string;
  status: ContentStatus;
};

export async function getLatestNotices(limit: number): Promise<Notice[]> {
  const client = supabaseAdmin;
  const { data, error } = await client
    .from('notices')
    .select('*')
    .eq('status', 'published')
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('id', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('getLatestNotices error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getLatestNotices: data is not an array:', data);
    return [];
  }
  return data as Notice[];
}

export async function getNotice(id: number): Promise<Notice | undefined> {
  const client = supabaseAdmin;
  const { data, error } = await client
    .from('notices')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();
  
  if (error || !data) return undefined;
  return data as Notice;
}

export type Material = {
  id: number;
  title: string;
  description: string;
  file_url: string;
  class_level: string;
  subject: string;
  status: ContentStatus;
};

export async function getMaterials(filters?: { q?: string; classLevel?: string; subject?: string }): Promise<Material[]> {
  const client = supabaseAdmin;
  let query = client.from('materials').select('*').eq('status', 'published');
  
  if (filters?.q) {
    query = query.ilike('title', `%${filters.q}%`);
  }
  if (filters?.classLevel) {
    query = query.eq('class_level', filters.classLevel);
  }
  if (filters?.subject) {
    query = query.eq('subject', filters.subject);
  }
  
  query = query.order('id', { ascending: false });
  
  const { data, error } = await query;
  if (error) {
    console.error('getMaterials error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getMaterials: data is not an array:', data);
    return [];
  }
  return data as Material[];
}

export type Inquiry = {
  id: number;
  student_name: string;
  parent_name: string;
  phone: string;
  email: string;
  class_applying: string;
  message: string;
  status: "new" | "contacted" | "enrolled" | "closed";
  created_at: string;
};

export async function createInquiry(data: Omit<Inquiry, 'id' | 'status' | 'created_at'>): Promise<Inquiry> {
  const client = supabaseAdmin;
  const { data: inquiry, error } = await client
    .from('inquiries')
    .insert({ ...data, status: 'new', created_at: new Date().toISOString() })
    .select()
    .single();
  
  if (error) throw error;
  return inquiry as Inquiry;
}

export async function getInquiries(): Promise<Inquiry[]> {
  const client = supabaseAdmin;
  const { data, error } = await client
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('getInquiries error:', error);
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('getInquiries: data is not an array:', data);
    return [];
  }
  return data as Inquiry[];
}