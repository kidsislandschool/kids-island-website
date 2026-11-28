/**
 * Describes every editable content block so the Master Admin gets real,
 * field-based editors instead of raw JSON.
 */

export type ContentField = {
  name: string;
  label: string;
  kind:
    | "text"
    | "textarea"
    | "richtext"
    | "url"
    | "image"
    | "number"
    | "boolean"
    | "select"
    | "string-list"
    | "object"
    | "object-list";
  help?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  fields?: ContentField[];
  itemLabel?: string;
  addLabel?: string;
  max?: number;
};

export type ContentSchema = {
  key: string;
  label: string;
  group: "Homepage" | "About" | "Academics" | "Admissions" | "Contact" | "Site settings" | "SEO";
  description?: string;
  shape: "object" | "text";
  fields?: ContentField[];
};

const ctaFields: ContentField[] = [
  { name: "label", label: "Button label", kind: "text", required: true },
  { name: "href", label: "Button link", kind: "url", required: true, help: "Internal path like /admissions or a full URL." },
];

const statusNote = (text: string) => text;

export const CONTENT_SCHEMAS: Record<string, ContentSchema> = {
  "home.hero": {
    key: "home.hero",
    label: "Hero",
    group: "Homepage",
    description: "The first screen of the homepage.",
    shape: "object",
    fields: [
      { name: "eyebrow", label: "Eyebrow pill", kind: "text" },
      { name: "headline", label: "Headline", kind: "textarea", required: true, help: "The phrase “bright futures” gets a yellow underline automatically." },
      { name: "intro", label: "Intro paragraph", kind: "textarea", required: true },
      { name: "primaryCta", label: "Primary button", kind: "object", fields: ctaFields },
      { name: "secondaryCta", label: "Secondary button", kind: "object", fields: ctaFields },
      { name: "badges", label: "Trust badges", kind: "string-list", help: "Short factual labels, e.g. “Nursery to Class 12”." },
      {
        name: "slides",
        label: "Hero slideshow",
        kind: "object-list",
        itemLabel: "label",
        addLabel: "Add slide",
        fields: [
          { name: "label", label: "Caption", kind: "text", required: true },
          { name: "image", label: "Photo", kind: "image", help: "Leave empty to use the illustrated placeholder." },
          { name: "alt", label: "Alt text", kind: "text" },
          {
            name: "variant",
            label: "Placeholder art",
            kind: "select",
            options: [
              { value: "classroom", label: "Classroom" },
              { value: "science", label: "Science lab" },
              { value: "library", label: "Library" },
              { value: "play", label: "Play & sport" },
              { value: "outdoor", label: "Outdoors" },
              { value: "art", label: "Art" },
              { value: "school", label: "School building" },
            ],
          },
        ],
      },
    ],
  },

  "home.highlights": {
    key: "home.highlights",
    label: "Trust row",
    group: "Homepage",
    description: "Four short trust points below the hero. Only publish claims the school approves.",
    shape: "object",
    // Represented as an object-list root through the special "items" field.
    fields: [
      {
        name: "__items__",
        label: "Highlights",
        kind: "object-list",
        itemLabel: "title",
        addLabel: "Add highlight",
        fields: [
          { name: "title", label: "Title", kind: "text", required: true },
          { name: "text", label: "Description", kind: "textarea", required: true },
          {
            name: "icon",
            label: "Icon",
            kind: "select",
            options: [
              { value: "book", label: "Book" },
              { value: "sparkle", label: "Sparkle" },
              { value: "teacher", label: "Graduation cap" },
              { value: "shield", label: "Shield" },
            ],
          },
        ],
      },
    ],
  },

  "home.programs": {
    key: "home.programs",
    label: "Academic programs",
    group: "Homepage",
    shape: "object",
    fields: [
      {
        name: "__items__",
        label: "Program cards",
        kind: "object-list",
        itemLabel: "title",
        addLabel: "Add program",
        fields: [
          { name: "title", label: "Title", kind: "text", required: true },
          { name: "stage", label: "Classes / stage", kind: "text", required: true },
          { name: "text", label: "Description", kind: "textarea", required: true },
          {
            name: "variant",
            label: "Card colour",
            kind: "select",
            options: [
              { value: "pink", label: "Pink" },
              { value: "blue", label: "Blue" },
              { value: "green", label: "Green" },
              { value: "amber", label: "Amber" },
            ],
          },
        ],
      },
    ],
  },

  "home.facilities": {
    key: "home.facilities",
    label: "Facilities",
    group: "Homepage",
    shape: "object",
    fields: [
      {
        name: "__items__",
        label: "Facility cards",
        kind: "object-list",
        itemLabel: "title",
        addLabel: "Add facility",
        fields: [
          { name: "title", label: "Facility", kind: "text", required: true },
          { name: "text", label: "Description", kind: "textarea" },
          { name: "image", label: "Photo", kind: "image", help: "Optional. Falls back to the illustration." },
          {
            name: "variant",
            label: "Placeholder art",
            kind: "select",
            options: [
              { value: "classroom", label: "Classroom" },
              { value: "library", label: "Library" },
              { value: "science", label: "Science lab" },
              { value: "computer", label: "Computer lab" },
              { value: "play", label: "Turf / sport" },
              { value: "outdoor", label: "Playground" },
            ],
          },
        ],
      },
    ],
  },

  "home.stats": {
    key: "home.stats",
    label: "Achievement stats",
    group: "Homepage",
    description:
      "UNVERIFIED extracted figures. The stats band stays hidden on the public site until this block is published.",
    shape: "object",
    fields: [
      {
        name: "__items__",
        label: "Stats",
        kind: "object-list",
        itemLabel: "label",
        addLabel: "Add stat",
        fields: [
          { name: "value", label: "Number", kind: "number", required: true },
          { name: "suffix", label: "Suffix", kind: "text", placeholder: "+ or %" },
          { name: "label", label: "Label", kind: "text", required: true },
        ],
      },
    ],
  },

  "home.cta": {
    key: "home.cta",
    label: "Admissions banner",
    group: "Homepage",
    shape: "object",
    fields: [
      { name: "title", label: "Heading", kind: "text", required: true },
      { name: "text", label: "Text", kind: "textarea" },
      { name: "primary", label: "Primary button", kind: "object", fields: ctaFields },
      { name: "secondary", label: "Secondary button", kind: "object", fields: ctaFields },
    ],
  },

  "home.principal": {
    key: "home.principal",
    label: "Message from the school",
    group: "Homepage",
    description:
      "Only publish a verified message, name and photograph from the principal. The seed value is a clearly-marked placeholder.",
    shape: "object",
    fields: [
      { name: "heading", label: "Heading", kind: "text", required: true },
      { name: "body", label: "Message", kind: "textarea", required: true },
      { name: "authorName", label: "Name", kind: "text", required: true },
      { name: "authorRole", label: "Role", kind: "text" },
      { name: "photo", label: "Photograph", kind: "image" },
      { name: "note", label: "Internal note (not shown publicly)", kind: "textarea" },
    ],
  },

  "home.why": {
    key: "home.why",
    label: "Why choose us (pinned sequence)",
    group: "Homepage",
    description: "Powers the GSAP pinned scroll sequence on the homepage — 3–5 steps works best.",
    shape: "object",
    fields: [
      {
        name: "__items__",
        label: "Steps",
        kind: "object-list",
        itemLabel: "title",
        addLabel: "Add step",
        max: 6,
        fields: [
          { name: "step", label: "Step number", kind: "text", required: true, placeholder: "01" },
          { name: "title", label: "Title", kind: "text", required: true },
          { name: "text", label: "Description", kind: "textarea", required: true },
          {
            name: "variant",
            label: "Card art",
            kind: "select",
            options: [
              { value: "classroom", label: "Classroom" },
              { value: "science", label: "Science" },
              { value: "library", label: "Library" },
              { value: "play", label: "Play" },
            ],
          },
        ],
      },
    ],
  },

  "about.page": {
    key: "about.page",
    label: "About page",
    group: "About",
    shape: "object",
    fields: [
      { name: "heading", label: "Page intro line", kind: "text", required: true },
      { name: "introHeading", label: "Story heading", kind: "text", required: true },
      { name: "story", label: "Story paragraphs", kind: "string-list", placeholder: "Add a paragraph" },
      { name: "mission", label: "Mission", kind: "textarea" },
      { name: "vision", label: "Vision", kind: "textarea" },
      {
        name: "values",
        label: "Core values",
        kind: "object-list",
        itemLabel: "title",
        addLabel: "Add value",
        fields: [
          { name: "title", label: "Value", kind: "text", required: true },
          { name: "text", label: "Description", kind: "textarea" },
        ],
      },
      {
        name: "whyChoose",
        label: "Why choose us",
        kind: "object-list",
        itemLabel: "title",
        addLabel: "Add reason",
        fields: [
          { name: "title", label: "Title", kind: "text", required: true },
          { name: "text", label: "Description", kind: "textarea" },
        ],
      },
      { name: "facilities", label: "Facilities list", kind: "string-list" },
    ],
  },

  "about.stats": {
    key: "about.stats",
    label: "About stats",
    group: "About",
    description: "Unverified figures — hidden publicly until published.",
    shape: "object",
    fields: [
      {
        name: "__items__",
        label: "Stats",
        kind: "object-list",
        itemLabel: "label",
        addLabel: "Add stat",
        fields: [
          { name: "value", label: "Number", kind: "number", required: true },
          { name: "suffix", label: "Suffix", kind: "text" },
          { name: "label", label: "Label", kind: "text", required: true },
        ],
      },
    ],
  },

  "academics.page": {
    key: "academics.page",
    label: "Academics page",
    group: "Academics",
    shape: "object",
    fields: [
      { name: "heading", label: "Heading", kind: "text", required: true },
      { name: "intro", label: "Intro", kind: "textarea" },
      {
        name: "stages",
        label: "Stages",
        kind: "object-list",
        itemLabel: "title",
        addLabel: "Add stage",
        fields: [
          { name: "title", label: "Title", kind: "text", required: true },
          { name: "classes", label: "Classes", kind: "text", required: true },
          { name: "text", label: "Description", kind: "textarea" },
          { name: "points", label: "Highlights", kind: "string-list" },
          {
            name: "variant",
            label: "Card colour",
            kind: "select",
            options: [
              { value: "pink", label: "Pink" },
              { value: "blue", label: "Blue" },
              { value: "green", label: "Green" },
              { value: "amber", label: "Amber" },
            ],
          },
        ],
      },
    ],
  },

  "admissions.page": {
    key: "admissions.page",
    label: "Admissions page",
    group: "Admissions",
    shape: "object",
    fields: [
      { name: "heading", label: "Heading", kind: "text", required: true },
      { name: "subheading", label: "Subheading", kind: "textarea" },
      {
        name: "steps",
        label: "Process steps",
        kind: "object-list",
        itemLabel: "title",
        addLabel: "Add step",
        fields: [
          { name: "step", label: "Step label", kind: "text", required: true },
          { name: "title", label: "Title", kind: "text", required: true },
          { name: "text", label: "Description", kind: "textarea" },
        ],
      },
      { name: "documents", label: "Required documents", kind: "string-list" },
      { name: "important", label: "Important notes", kind: "string-list" },
      { name: "classes", label: "Classes in the form", kind: "string-list" },
      { name: "contactPhone", label: "Admissions phone", kind: "text" },
      { name: "contactEmail", label: "Admissions email", kind: "text" },
    ],
  },

  "admissions.eligibility": {
    key: "admissions.eligibility",
    label: "Eligibility",
    group: "Admissions",
    description:
      "Available extracted eligibility rules. Contains a board/age guideline inconsistency — review before publishing.",
    shape: "object",
    fields: [
      {
        name: "__items__",
        label: "Rules",
        kind: "object-list",
        itemLabel: "title",
        addLabel: "Add rule",
        fields: [
          { name: "title", label: "Class", kind: "text", required: true },
          { name: "text", label: "Rule", kind: "textarea", required: true },
        ],
      },
    ],
  },

  "contact.page": {
    key: "contact.page",
    label: "Contact page",
    group: "Contact",
    shape: "object",
    fields: [
      { name: "heading", label: "Heading", kind: "text", required: true },
      { name: "intro", label: "Intro", kind: "textarea" },
      { name: "address", label: "Address", kind: "textarea" },
      { name: "phone", label: "Phone", kind: "text" },
      { name: "email", label: "Email", kind: "text" },
      { name: "whatsapp", label: "WhatsApp", kind: "text" },
      { name: "hoursPhone", label: "Phone hours", kind: "text" },
      { name: "hoursOffice", label: "Office hours", kind: "text" },
      { name: "visitHeading", label: "Visit heading", kind: "text" },
      { name: "visitText", label: "Visit text", kind: "textarea" },
    ],
  },

  "contact.directions": {
    key: "contact.directions",
    label: "Directions",
    group: "Contact",
    description: "Distances are unverified — the list stays hidden publicly until published.",
    shape: "object",
    fields: [
      {
        name: "__items__",
        label: "Landmarks",
        kind: "object-list",
        itemLabel: "title",
        addLabel: "Add landmark",
        fields: [
          { name: "title", label: "Landmark", kind: "text", required: true },
          { name: "text", label: "Distance / note", kind: "text" },
        ],
      },
    ],
  },

  "faculty.page": {
    key: "faculty.page",
    label: "Faculty page copy",
    group: "Site settings",
    shape: "object",
    fields: [
      { name: "heading", label: "Heading", kind: "text" },
      { name: "intro", label: "Intro", kind: "textarea" },
      { name: "emptyState", label: "Empty state message", kind: "textarea" },
    ],
  },

  "materials.page": {
    key: "materials.page",
    label: "Study materials copy",
    group: "Site settings",
    shape: "object",
    fields: [
      { name: "title", label: "Title", kind: "text" },
      { name: "intro", label: "Intro", kind: "textarea" },
      { name: "emptyState", label: "Empty state message", kind: "textarea" },
    ],
  },

  "gallery.page": {
    key: "gallery.page",
    label: "Gallery copy",
    group: "Site settings",
    shape: "object",
    fields: [
      { name: "title", label: "Title", kind: "text" },
      { name: "intro", label: "Intro", kind: "textarea" },
      { name: "emptyState", label: "Empty state message", kind: "textarea" },
    ],
  },

  "settings.site": {
    key: "settings.site",
    label: "School details",
    group: "Site settings",
    description: "Used across the header, footer, contact page and structured data.",
    shape: "object",
    fields: [
      { name: "name", label: "School name", kind: "text", required: true },
      { name: "shortName", label: "Short name", kind: "text", required: true },
      { name: "tagline", label: "Tagline", kind: "text" },
      { name: "location", label: "Location line", kind: "text" },
      { name: "phone", label: "Phone", kind: "text" },
      { name: "email", label: "Email", kind: "text" },
      { name: "whatsapp", label: "WhatsApp", kind: "text" },
      { name: "whatsappNote", label: "WhatsApp note", kind: "text", help: statusNote("Availability claims must be verified before publishing.") },
      { name: "hoursPhone", label: "Phone hours", kind: "text" },
      { name: "hoursOffice", label: "Office hours", kind: "text" },
      { name: "hoursMonSat", label: "Monday – Saturday hours", kind: "text", help: "Shown as a row in the contact page office hours card." },
      { name: "hoursFriday", label: "Friday hours", kind: "text", help: "Friday closes earlier — set the exact time, e.g. 8:00 AM – 12:00 PM (noon)." },
      { name: "logoText", label: "Logo wordmark", kind: "text" },
      {
        name: "socials",
        label: "Social links",
        kind: "object-list",
        itemLabel: "label",
        addLabel: "Add social link",
        help: "Only add links that actually exist and are controlled by the school.",
        fields: [
          { name: "label", label: "Platform", kind: "text", required: true },
          { name: "url", label: "URL", kind: "url", required: true },
        ],
      },
    ],
  },

  "settings.nav": {
    key: "settings.nav",
    label: "Navigation",
    group: "Site settings",
    shape: "object",
    fields: [
      {
        name: "links",
        label: "Main menu",
        kind: "object-list",
        itemLabel: "label",
        addLabel: "Add menu link",
        fields: [
          { name: "label", label: "Label", kind: "text", required: true },
          { name: "href", label: "Link", kind: "url", required: true },
        ],
      },
      { name: "cta", label: "Header button", kind: "object", fields: ctaFields },
    ],
  },

  "settings.footer": {
    key: "settings.footer",
    label: "Footer",
    group: "Site settings",
    shape: "object",
    fields: [
      { name: "blurb", label: "Footer blurb", kind: "textarea" },
      {
        name: "quickLinks",
        label: "Quick links",
        kind: "object-list",
        addLabel: "Add quick link",
        itemLabel: "label",
        fields: ctaFields,
      },
      {
        name: "resources",
        label: "Resources",
        kind: "object-list",
        addLabel: "Add resource link",
        itemLabel: "label",
        fields: ctaFields,
      },
      {
        name: "legal",
        label: "Legal links",
        kind: "object-list",
        addLabel: "Add legal link",
        itemLabel: "label",
        fields: ctaFields,
      },
      { name: "copyright", label: "Copyright line", kind: "text" },
    ],
  },

  "settings.affiliation": {
    key: "settings.affiliation",
    label: "Affiliation claim",
    group: "Site settings",
    description:
      "The current website claims UP Board affiliation, while admissions content references CBSE age guidelines. Confirm the correct position with the school before publishing.",
    shape: "text",
  },

  "settings.seo": {
    key: "settings.seo",
    label: "Page SEO",
    group: "SEO",
    description: "Title and description used for each page's metadata.",
    shape: "object",
    fields: (
      [
        ["/", "Home"],
        ["/about", "About"],
        ["/academics", "Academics"],
        ["/admissions", "Admissions"],
        ["/faculty", "Faculty"],
        ["/study-materials", "Study Materials"],
        ["/gallery", "Gallery"],
        ["/notices", "Notices"],
        ["/contact", "Contact"],
        ["/admin-login", "Admin Login"],
        ["/staff-login", "Staff Login"],
      ] as const
    ).map(([path, label]) => ({
      name: path,
      label,
      kind: "object" as const,
      fields: [
        { name: "title", label: "Meta title", kind: "text" as const, required: true },
        { name: "description", label: "Meta description", kind: "textarea" as const },
      ],
    })),
  },
};

/** Public site content keys grouped for the admin list. */
export const CONTENT_GROUPS = [
  "Homepage",
  "About",
  "Academics",
  "Admissions",
  "Contact",
  "Site settings",
  "SEO",
] as const;

/** Collections where the editor stores a bare array under `__items__`. */
export function unwrapItems(value: unknown): unknown {
  if (value && typeof value === "object" && !Array.isArray(value) && "__items__" in value) {
    return { ...(value as Record<string, unknown>), __items__: (value as Record<string, unknown>).__items__ };
  }
  return value;
}
