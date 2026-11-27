import type { MetadataRoute } from "next";
import { getLatestNotices, getPublishedFaculty, getPublishedAlbums, getPublishedTestimonials } from "@/lib/data";
import { siteOrigin } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const BASE = siteOrigin();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/about", priority: 0.8, freq: "monthly" },
    { path: "/academics", priority: 0.8, freq: "monthly" },
    { path: "/admissions", priority: 0.9, freq: "weekly" },
    { path: "/faculty", priority: 0.7, freq: "monthly" },
    { path: "/study-materials", priority: 0.7, freq: "weekly" },
    { path: "/gallery", priority: 0.7, freq: "monthly" },
    { path: "/notices", priority: 0.8, freq: "daily" },
    { path: "/contact", priority: 0.7, freq: "monthly" },
    { path: "/privacy", priority: 0.2, freq: "yearly" },
    { path: "/terms", priority: 0.2, freq: "yearly" },
  ];

  let noticeRoutes: MetadataRoute.Sitemap = [];
  let facultyRoutes: MetadataRoute.Sitemap = [];
  let albumRoutes: MetadataRoute.Sitemap = [];
  let testimonialRoutes: MetadataRoute.Sitemap = [];

  try {
    const [notices, faculty, albums, testimonials] = await Promise.all([
      getLatestNotices(200),
      getPublishedFaculty(),
      getPublishedAlbums(),
      getPublishedTestimonials(),
    ]);

    noticeRoutes = notices.map((notice) => ({
      url: `${BASE}/notices/${notice.id}`,
      lastModified: new Date(notice.published_at ?? notice.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

    facultyRoutes = faculty.map((member) => ({
      url: `${BASE}/faculty#${member.id}`,
      lastModified: new Date(member.updated_at ?? now),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

    albumRoutes = albums.map((album) => ({
      url: `${BASE}/gallery#${album.id}`,
      lastModified: new Date(album.updated_at ?? now),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

    testimonialRoutes = testimonials.map((t) => ({
      url: `${BASE}/#testimonial-${t.id}`,
      lastModified: new Date(t.updated_at ?? now),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }));
  } catch {
    /* fallback to empty arrays */
  }

  return [
    ...staticRoutes.map((route) => ({
      url: `${BASE}${route.path}`,
      lastModified: now,
      changeFrequency: route.freq,
      priority: route.priority,
    })),
    ...noticeRoutes,
    ...facultyRoutes,
    ...albumRoutes,
    ...testimonialRoutes,
  ];
}
