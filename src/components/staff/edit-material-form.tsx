"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { UploadInput } from "@/components/admin/upload-input";
import { AdminField, adminInput, adminSelect, adminTextarea } from "@/components/admin/ui";
import { cn, formatDateTime } from "@/lib/utils";

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
  { value: "published", label: "Published — Students can see it" },
  { value: "draft", label: "Draft — Saved, not visible" },
  { value: "needs_review", label: "Needs Review — Pending approval" },
];

interface EditMaterialFormProps {
  material: {
    id: number;
    title: string;
    class_level: string;
    subject: string;
    description: string | null;
    file_url: string | null;
    tags: string | null;
    status: string;
    published_at: string | null;
    created_at: string;
    updated_at: string;
  };
}

export function EditMaterialForm({ material }: EditMaterialFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(`/api/staff/materials/${material.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update material");

      redirect("/staff/dashboard/materials");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update material");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <StaffCard title="Basic Information">
        <AdminField label="Material Title *" htmlFor="title" required>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={material.title}
            className={adminInput}
            placeholder="Enter a clear, descriptive title"
            disabled={submitting}
          />
        </AdminField>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField label="Class / Grade *" htmlFor="class_level" required>
            <select
              id="class_level"
              name="class_level"
              required
              defaultValue={material.class_level}
              className={adminSelect}
              disabled={submitting}
            >
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
              defaultValue={material.subject}
              className={adminSelect}
              disabled={submitting}
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
            defaultValue={material.description ?? ""}
            placeholder="e.g. 'Practice worksheet for quadratic equations with step-by-step solutions'"
            disabled={submitting}
          />
        </AdminField>

        <AdminField label="Tags" htmlFor="tags" help="Comma-separated keywords for search (optional)">
          <input
            id="tags"
            name="tags"
            type="text"
            className={adminInput}
            defaultValue={material.tags ?? ""}
            placeholder="algebra, worksheet, practice, quadratic"
            disabled={submitting}
          />
        </AdminField>
      </StaffCard>

      <StaffCard title="File">
        <AdminField label="Current File" htmlFor="file_upload">
          {material.file_url ? (
            <div className="flex items-center gap-3">
              <Link href={material.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue hover:underline">
                <Icon name="file" className="h-5 w-5" />
                <span className="truncate max-w-[300px]">{material.file_url.split("/").pop()}</span>
              </Link>
            </div>
          ) : (
            <span className="text-muted">No file uploaded</span>
          )}
        </AdminField>

        <AdminField label="Replace File" htmlFor="file_upload" help="Upload a new file to replace the current one (optional)">
          <FileUploadField
            name="file_url"
            label="Choose File *"
            kind="file"
            required={false}
            uploadEndpoint="/api/staff/uploads"
          />
        </AdminField>
      </StaffCard>

      <StaffCard title="Visibility">
        <AdminField label="Status *" htmlFor="status" required>
          <select
            id="status"
            name="status"
            required
            defaultValue={material.status}
            className={adminSelect}
            disabled={submitting}
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
            defaultValue={material.published_at?.slice(0, 10) ?? ""}
            className={adminInput}
            disabled={submitting}
          />
        </AdminField>
      </StaffCard>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#F3C6D1] bg-[#FFF1F4] px-4 py-3 text-[12px] font-bold text-[#A32D4A]" role="alert">
          <Icon name="alert-circle" className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/staff/dashboard/materials"
          className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-5 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving…
            </>
          ) : (
            <>
              <Icon name="check" className="h-4 w-4" strokeWidth={2.6} />
              Save Changes
            </>
          )}
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