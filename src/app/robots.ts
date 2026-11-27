import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";

const BASE = siteOrigin();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/staff-login", "/admin-login", "/dashboard/"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/staff-login", "/admin-login", "/dashboard/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
