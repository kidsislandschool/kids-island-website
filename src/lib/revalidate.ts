import { revalidatePath } from "next/cache";

/**
 * Public routes that display each CMS collection. Admin writes call
 * revalidateCollection() so the statically cached public pages pick up new
 * notices, photos, faculty, FAQs and testimonials immediately instead of
 * waiting for the 60 second ISR window.
 */
const COLLECTION_PATHS: Record<string, string[]> = {
  notices: ["/", "/notices"],
  faculty: ["/", "/faculty"],
  materials: ["/", "/study-materials"],
  testimonials: ["/"],
  faqs: ["/contact"],
  gallery_albums: ["/", "/gallery"],
  gallery_photos: ["/", "/gallery"],
  students: [],
};

export function revalidateCollection(key: string) {
  const paths = COLLECTION_PATHS[key] ?? [];
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {
      // revalidatePath is only available in a request scope; ignore elsewhere.
    }
  }
  // Detail pages live under /notices/[id].
  if (key === "notices") {
    try {
      revalidatePath("/notices/[id]", "page");
    } catch {
      /* ignore */
    }
  }
}

export function revalidatePublicSite() {
  for (const path of ["/", "/notices", "/study-materials", "/faculty", "/gallery", "/contact"]) {
    try {
      revalidatePath(path);
    } catch {
      /* ignore */
    }
  }
}
