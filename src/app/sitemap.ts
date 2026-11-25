import type { MetadataRoute } from "next";
import { getLatestNotices } from "@/lib/data";
import { siteOrigin } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const BASE = siteOrigin();

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/about", priority: 0.8, freq: "monthly" },
    { path: "/academics", priority: 0.8, freq: "monthly" },
    { path: "/admissions", priority: 0.9, freq: "weekly" },
    { path: "/faculty", priority: 0.6, freq: "monthly" },
    { path: "/study-materials", priority: 0.7, freq: "weekly" },
    { path: "/gallery", priority: 0.6, freq: "monthly" },
    { path: "/notices", priority: 0.8, freq: "daily" },
    { path: "/contact", priority: 0.7, freq: "monthly" },
    { path: "/privacy", priority: 0.2, freq: "yearly" },
    { path: "/terms", priority: 0.2, freq: "yearly" },
  ];

  let noticeRoutes: MetadataRoute.Sitemap = [];
  try {
    noticeRoutes = getLatestNotices(200).map((notice) => ({
      url: `${BASE}/notices/${notice.id}`,
      lastModified: new Date(notice.published_at ?? notice.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    noticeRoutes = [];
  }

  return [
    ...staticRoutes.map((route) => ({
      url: `${BASE}${route.path}`,
      lastModified: now,
      changeFrequency: route.freq,
      priority: route.priority,
    })),
    ...noticeRoutes,
  ];
}
