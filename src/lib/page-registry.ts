/**
 * Pure registry of the public pages managed by the CMS.
 *
 * Used by the admin "Pages" overview, the SEO manager and the content list so
 * that routes, labels and the content blocks that drive them stay in sync.
 * Keep this file free of server-only imports — the SEO editor is a client
 * component.
 */

export type ManagedPage = {
  path: string;
  label: string;
  /** Short description shown in the admin. */
  summary: string;
  /** Content blocks that drive the page. */
  contentKeys: string[];
  /** Collections shown on the page. */
  collections?: string[];
  /** Whether this page has an editable SEO entry. */
  seo?: boolean;
  group: "Main pages" | "Portals";
};

export const MANAGED_PAGES: ManagedPage[] = [
  {
    path: "/",
    label: "Home",
    summary: "Hero, trust row, programmes, facilities, principal message, why-us sequence, stats and latest notices/testimonials.",
    contentKeys: [
      "home.hero",
      "home.highlights",
      "home.programs",
      "home.facilities",
      "home.cta",
      "home.principal",
      "home.why",
      "home.stats",
    ],
    collections: ["notices", "testimonials"],
    seo: true,
    group: "Main pages",
  },
  {
    path: "/about",
    label: "About Us",
    summary: "School story, mission, vision, values, why-choose reasons, facilities list and stats.",
    contentKeys: ["about.page", "about.stats"],
    seo: true,
    group: "Main pages",
  },
  {
    path: "/academics",
    label: "Academics",
    summary: "Learning stages from nursery to senior secondary, streams and skill development.",
    contentKeys: ["academics.page"],
    seo: true,
    group: "Main pages",
  },
  {
    path: "/admissions",
    label: "Admissions",
    summary: "Admission process, documents, class list, contact details and eligibility rules. Admission enquiries appear under enquiries.",
    contentKeys: ["admissions.page", "admissions.eligibility"],
    seo: true,
    group: "Main pages",
  },
  {
    path: "/faculty",
    label: "Faculty",
    summary: "Published faculty profiles and the page intro copy.",
    contentKeys: ["faculty.page"],
    collections: ["faculty"],
    seo: true,
    group: "Main pages",
  },
  {
    path: "/study-materials",
    label: "Study Materials",
    summary: "Downloadable notes and resources, filterable by class and subject.",
    contentKeys: ["materials.page"],
    collections: ["materials"],
    seo: true,
    group: "Main pages",
  },
  {
    path: "/gallery",
    label: "Gallery",
    summary: "Photo albums, captions and alt text.",
    contentKeys: ["gallery.page"],
    collections: ["gallery_albums", "gallery_photos"],
    seo: true,
    group: "Main pages",
  },
  {
    path: "/notices",
    label: "Notices",
    summary: "Notices, events, holidays, exam updates and pinned announcements.",
    contentKeys: [],
    collections: ["notices"],
    seo: true,
    group: "Main pages",
  },
  {
    path: "/contact",
    label: "Contact",
    summary: "Contact details, visiting information, directions and FAQs.",
    contentKeys: ["contact.page", "contact.directions"],
    collections: ["faqs"],
    seo: true,
    group: "Main pages",
  },
  {
    path: "/student-login",
    label: "Student Login",
    summary: "Placeholder page — student authentication is not part of this phase.",
    contentKeys: [],
    seo: true,
    group: "Portals",
  },
  {
    path: "/staff-login",
    label: "Staff Login",
    summary: "Master Admin sign-in. The account is managed under Account.",
    contentKeys: [],
    seo: true,
    group: "Portals",
  },
];

/** Pages with a `settings.seo` entry, in the order they appear in the SEO manager. */
export const SEO_PAGES = MANAGED_PAGES.filter((page) => page.seo);

/** Which public page a content block primarily drives. */
export function pageForContentKey(key: string): ManagedPage | undefined {
  return MANAGED_PAGES.find((page) => page.contentKeys.includes(key));
}

export function publicPathForContentKey(key: string): string {
  return pageForContentKey(key)?.path ?? "/";
}
