import type { Metadata } from "next";
import { getSeo, getSiteSettings, type PageSeo } from "./content";

/**
 * Builds the metadata for a public page from the CMS SEO overrides, falling
 * back to the page's built-in title and description.
 *
 * - Avoids double-branding: if the CMS title already contains the school name,
 *   it is used as an absolute title instead of "{title} | Kids Island".
 * - Uses the optional canonical and social image managed under /admin/seo.
 */
export async function buildPageMetadata(
  path: string,
  fallback: PageSeo,
  opts: { noIndex?: boolean } = {}
): Promise<Metadata> {
  const seo = await getSeo(path, fallback);
  const site = await getSiteSettings();
  const title = seo.title.trim();
  const description = seo.description.trim();
  const canonical = seo.canonical?.trim() || path;
  const ogImage = seo.ogImage?.trim();

  const brandNames = [site.name, site.shortName]
    .map((name) => name?.toLowerCase().trim())
    .filter((name): name is string => Boolean(name));
  const alreadyBranded = brandNames.some((name) => title.toLowerCase().includes(name));

  return {
    title: alreadyBranded ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: site.name,
      title,
      description,
      url: canonical,
      ...(ogImage ? { images: [{ url: ogImage, alt: title }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    ...(opts.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
