import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";

const BASE = siteOrigin();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/staff-login", "/admin-login"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
