import type { Metadata } from "next";
import Link from "next/link";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getStaffMaterials } from "@/lib/data";
import { StaffShell } from "@/components/staff/staff-shell";
import { Icon } from "@/components/ui/icon";
import { UploadInput } from "@/components/admin/upload-input";
import { AdminField, adminInput, adminSelect, adminTextarea } from "@/components/admin/ui";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Upload New Material" };

const CLASS_OPTIONS = [
  { value: "All", label: "All Classes" },
  { value: "Nursery", label: "Nursery" },
  { value: "LKG", label: "LKG" },
  { value: "UKG", label: "UKG" },
  ...Array.from({ length: 12 }, (_, i) => ({ value: `Class ${i + 1}`, label: `Class ${i + 1}` })),
];

const SUBJECT_OPTIONS = [
  { value: "Mathematics", label: "Mathematics" },
  { value: "Science", label: "Science" },
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "Social Science", label: "Social Science" },
  { value: "Computer", label: "Computer" },
  { value: "General", label: "General / Other" },
];

const STATUS_OPTIONS = [
  { value: "published", label: "Published — Students can see it immediately" },
  { value: "draft", label: "Draft — Save for later, not visible to students" },
  { value: "needs_review", label: "Needs Review — Send to admin for approval" },
];

export default function NewMaterialPage() {
  return (
    <NewMaterialForm />
  );
}

function NewMaterialForm() {
  return (
    <form action={async (formData: FormData) => {
      "use server";
      const db = (await import("@/lib/db")).getDb();
      const { getStaffSession } = await import("@/lib/auth");
      const session = await getStaffSession();
      if (!session) throw new Error("Not authenticated");
      
      const title = formData.get("title") as string;
      const class_level = formData.get("class_level") as string;
      const subject = formData.get("subject") as string;
      const description = formData.get("description") as string;
      const file_url = formData.get("file_url") as string;
      const tags = formData.get("tags") as string;
      const status = formData.get("status") as string;
      const published_at = formData.get("published_at") as string || null;

      if (!title || !class_level || !subject) {
        throw new Error("Please fill in all required fields (Title, Class, Subject).");
      }

      db.prepare(
        `INSERT INTO materials (title, class_level, subject, description, file_url, tags, status, published_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(title, class_level, subject, description, file_url || null, tags || null, status, published_at, session.user.id);
    }} className="space-y-6">
      <StaffCard title="Basic Information">
        <AdminField label="Material Title *" htmlFor="title" required help="What are you uploading? e.g. 'Chapter 1: Algebra Notes'">
          <input
            id="title"
            name="title"
            type="text"
            required
            className={adminInput}
            placeholder="Enter a clear, descriptive title"
          />
        </AdminField>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField label="Class / Grade *" htmlFor="class_level" required>
            <select
              id="class_level"
              name="class_level"
              required
              className={adminSelect}
            >
              <option value="">Select class…</option>
              {CLASS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </AdminField>

          <AdminField label="Subject *" htmlFor="subject" required>
            <select
              id="subject"
              name="subject"
              required
              className={adminSelect}
            >
              <option value="">Select subject…</option>
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </AdminField>
        </div>

        <AdminField label="Description" htmlFor="description" help="Brief summary of what this material covers (optional)">
          <textarea
            id="description"
            name="description"
            rows={3}
            className={adminTextarea}
            placeholder="e.g. 'Practice worksheet for quadratic equations with step-by-step solutions'"
          />
        </AdminField>

        <AdminField label="Tags" htmlFor="tags" help="Comma-separated keywords for search (optional)">
          <input
            id="tags"
            name="tags"
            type="text"
            className={adminInput}
            placeholder="algebra, worksheet, practice, quadratic"
          />
        </AdminField>
      </StaffCard>

      <StaffCard title="Upload File">
        <AdminField
          label="Choose File *"
          htmlFor="file_upload"
          required
          help="PDF, JPG, PNG, WebP — max 12 MB. PDFs are best for documents. Images will be converted to WebP."
        >
          <UploadInput
            id="file_upload"
            kind="file"
            value=""
            onChange={() => {}}
          />
        </AdminField>

        <p className="text-[11px] font-semibold text-muted">
          Tip: For best results, use PDF for documents and notes. Images will be automatically optimized.
        </p>
      </StaffCard>

      <StaffCard title="Visibility">
        <AdminField label="Status *" htmlFor="status" required>
          <select
            id="status"
            name="status"
            required
            className={adminSelect}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </AdminField>

        <AdminField label="Publish Date" htmlFor="published_at" help="Optional: Schedule when this goes live. Leave empty to publish immediately.">
          <input
            id="published_at"
            name="published_at"
            type="date"
            className={adminInput}
          />
        </AdminField>
      </StaffCard>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/staff/dashboard/materials"
          className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-5 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="check" className="h-4 w-4" strokeWidth={2.6} />
          Save Material
        </button>
      </div>
    </form>
  );
}

function StaffCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
      <h2 className="font-display text-[17px] font-semibold text-navy-900 mb-5">{title}</h2>
      {children}
    </div>
  );
}