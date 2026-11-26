/**
 * Declarative registry of CMS collections.
 *
 * One config per collection drives:
 *  - server-side validation in /api/admin/collections/[key]
 *  - the generic admin list + form UI
 *  - which columns are safe to write (never accepts arbitrary SQL columns)
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "url"
  | "image"
  | "file"
  | "number"
  | "select"
  | "checkbox"
  | "date"
  | "tags"
  | "order";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Show as a column in the admin table. */
  column?: boolean;
  /** Field used as the row's display title in the admin. */
  title?: boolean;
  /** Field searched by the list search box. */
  searchable?: boolean;
  /** Allow empty string / null. */
  optional?: boolean;
  min?: number;
  max?: number;
};

export type CollectionDef = {
  key: string;
  table: string;
  label: string;
  singular: string;
  /** Statuses allowed for this collection. */
  statuses: ("published" | "draft" | "needs_review")[];
  defaultStatus: "published" | "draft" | "needs_review";
  orderBy: string;
  fields: FieldDef[];
  /** Extra public query helper name (used by pages). */
  emptyMessage?: string;
};

const STATUS_FIELDS: FieldDef[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "published", label: "Published" },
      { value: "draft", label: "Draft" },
      { value: "needs_review", label: "Needs review" },
    ],
  },
];

export const COLLECTIONS: Record<string, CollectionDef> = {
  notices: {
    key: "notices",
    table: "notices",
    label: "Notices & Announcements",
    singular: "Notice",
    statuses: ["published", "draft", "needs_review"],
    defaultStatus: "published",
    orderBy: "pinned DESC, COALESCE(published_at, created_at) DESC",
    emptyMessage: "No notices published yet.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true, title: true, searchable: true, placeholder: "Annual Sports Day — Schedule" },
      { name: "category", label: "Category", type: "select", required: true, column: true, options: [
        { value: "Notice", label: "Notice" },
        { value: "Event", label: "Event" },
        { value: "Holiday", label: "Holiday" },
        { value: "Exam", label: "Exam" },
        { value: "Result", label: "Result" },
        { value: "General", label: "General" },
      ] },
      { name: "summary", label: "Summary", type: "textarea", searchable: true, placeholder: "One or two line preview shown on cards." },
      { name: "body", label: "Full details", type: "richtext" },
      { name: "image", label: "Image", type: "image", optional: true, help: "Upload an image for this notice (optional). Will be displayed on the notice card and detail page." },
      { name: "event_date", label: "Event / effective date", type: "date", optional: true, column: true },
      { name: "pinned", label: "Pin to top", type: "checkbox" },
      ...STATUS_FIELDS,
      { name: "published_at", label: "Publish date", type: "date", optional: true },
    ],
  },

  faculty: {
    key: "faculty",
    table: "faculty",
    label: "Faculty Members",
    singular: "Faculty Member",
    statuses: ["published", "draft", "needs_review"],
    defaultStatus: "published",
    orderBy: "order_index ASC, name ASC",
    emptyMessage: "No faculty profiles yet. Add the first one.",
    fields: [
      { name: "name", label: "Full name", type: "text", required: true, column: true, title: true, searchable: true },
      { name: "designation", label: "Designation", type: "text", column: true, searchable: true, placeholder: "e.g. Senior Teacher" },
      { name: "subjects", label: "Subject(s)", type: "tags", searchable: true, placeholder: "Maths, Science" },
      { name: "qualification", label: "Qualification", type: "text", placeholder: "e.g. M.Sc, B.Ed" },
      { name: "bio", label: "Short bio", type: "textarea" },
      { name: "photo", label: "Photograph", type: "image", optional: true, help: "Upload from the Media section or paste an image URL." },
      { name: "order_index", label: "Sort order", type: "order", optional: true },
      { name: "featured", label: "Featured", type: "checkbox" },
      ...STATUS_FIELDS,
    ],
  },

  materials: {
    key: "materials",
    table: "materials",
    label: "Study Materials",
    singular: "Study Material",
    statuses: ["published", "draft", "needs_review"],
    defaultStatus: "published",
    orderBy: "COALESCE(published_at, created_at) DESC",
    emptyMessage: "No study materials published yet.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true, title: true, searchable: true },
      { name: "class_level", label: "Class", type: "select", column: true, options: [
        { value: "All", label: "All classes" },
        { value: "Nursery", label: "Nursery" },
        { value: "LKG", label: "LKG" },
        { value: "UKG", label: "UKG" },
        ...Array.from({ length: 12 }, (_, i) => ({ value: `Class ${i + 1}`, label: `Class ${i + 1}` })),
      ] },
      { name: "subject", label: "Subject", type: "select", column: true, options: [
        { value: "Mathematics", label: "Mathematics" },
        { value: "Science", label: "Science" },
        { value: "English", label: "English" },
        { value: "Hindi", label: "Hindi" },
        { value: "Social Science", label: "Social Science" },
        { value: "Computer", label: "Computer" },
        { value: "General", label: "General" },
      ] },
      { name: "description", label: "Description", type: "textarea", searchable: true },
      { name: "file_url", label: "File / document URL", type: "file", optional: true, help: "PDF or document link students can download." },
      { name: "tags", label: "Tags", type: "tags", optional: true, searchable: true },
      { name: "published_at", label: "Publish date", type: "date", optional: true },
      ...STATUS_FIELDS,
    ],
  },

  testimonials: {
    key: "testimonials",
    table: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    statuses: ["published", "draft", "needs_review"],
    defaultStatus: "needs_review",
    orderBy: "order_index ASC, id ASC",
    emptyMessage: "No testimonials yet.",
    fields: [
      { name: "quote", label: "Quote", type: "textarea", required: true, title: true, searchable: true },
      { name: "author_name", label: "Name", type: "text", required: true, column: true, searchable: true },
      { name: "author_role", label: "Role", type: "text", column: true, placeholder: "e.g. Parent of Class 10 Student" },
      { name: "order_index", label: "Sort order", type: "order", optional: true },
      ...STATUS_FIELDS,
    ],
  },

  faqs: {
    key: "faqs",
    table: "faqs",
    label: "FAQs",
    singular: "FAQ",
    statuses: ["published", "draft", "needs_review"],
    defaultStatus: "needs_review",
    orderBy: "order_index ASC, id ASC",
    emptyMessage: "No FAQs yet.",
    fields: [
      { name: "question", label: "Question", type: "text", required: true, title: true, column: true, searchable: true },
      { name: "answer", label: "Answer", type: "textarea", required: true, searchable: true },
      { name: "category", label: "Category", type: "select", column: true, options: [
        { value: "General", label: "General" },
        { value: "Admissions", label: "Admissions" },
        { value: "Academics", label: "Academics" },
        { value: "Facilities", label: "Facilities" },
      ] },
      { name: "order_index", label: "Sort order", type: "order", optional: true },
      ...STATUS_FIELDS,
    ],
  },

  gallery_albums: {
    key: "gallery_albums",
    table: "gallery_albums",
    label: "Gallery Albums",
    singular: "Album",
    statuses: ["published", "draft", "needs_review"],
    defaultStatus: "published",
    orderBy: "order_index ASC, id ASC",
    emptyMessage: "No albums yet.",
    fields: [
      { name: "title", label: "Album title", type: "text", required: true, column: true, title: true, searchable: true },
      { name: "description", label: "Description", type: "textarea", searchable: true },
      { name: "cover_photo", label: "Cover image", type: "image", optional: true },
      { name: "order_index", label: "Sort order", type: "order", optional: true },
      ...STATUS_FIELDS,
    ],
  },

  gallery_photos: {
    key: "gallery_photos",
    table: "gallery_photos",
    label: "Gallery Photos",
    singular: "Photo",
    statuses: ["published", "draft", "needs_review"],
    defaultStatus: "published",
    orderBy: "order_index ASC, id ASC",
    emptyMessage: "No photos yet.",
    fields: [
      { name: "album_id", label: "Album", type: "select", required: true, column: true, options: [] },
      { name: "url", label: "Photo", type: "image", required: true, title: true },
      { name: "caption", label: "Caption", type: "text", searchable: true },
      { name: "alt", label: "Alt text (accessibility)", type: "text", required: true, help: "Describe the photo for screen readers." },
      { name: "order_index", label: "Sort order", type: "order", optional: true },
      { name: "featured", label: "Featured", type: "checkbox" },
      ...STATUS_FIELDS,
    ],
  },

  students: {
    key: "students",
    table: "students",
    label: "Students",
    singular: "Student",
    statuses: ["published", "draft", "needs_review"],
    defaultStatus: "published",
    orderBy: "admission_number ASC",
    emptyMessage: "No students yet.",
    fields: [
      { name: "admission_number", label: "Admission Number", type: "text", required: true, column: true, title: true, searchable: true },
      { name: "first_name", label: "First Name", type: "text", required: true, column: true, searchable: true },
      { name: "last_name", label: "Last Name", type: "text", required: true, column: true, searchable: true },
      { name: "class", label: "Class", type: "text", column: true, searchable: true },
      { name: "section", label: "Section", type: "text", column: true },
      { name: "date_of_birth", label: "Date of Birth", type: "date", optional: true },
      { name: "gender", label: "Gender", type: "select", optional: true, column: true, options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
      ]},
      { name: "parent_name", label: "Parent Name", type: "text", optional: true, column: true, searchable: true },
      { name: "parent_phone", label: "Parent Phone", type: "text", optional: true, searchable: true },
      { name: "parent_email", label: "Parent Email", type: "email", optional: true, searchable: true },
      { name: "address", label: "Address", type: "textarea", optional: true },
      ...STATUS_FIELDS,
    ],
  },
};

/** Columns that a collection is allowed to write (generated from its fields). */
export function allowedColumns(def: CollectionDef): Set<string> {
  return new Set(def.fields.map((f) => f.name));
}
