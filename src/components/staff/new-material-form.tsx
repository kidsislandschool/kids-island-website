"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { FileUploadField } from "@/components/staff/file-upload-field";
import { AdminField, adminInput, adminSelect, adminTextarea } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

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

export function NewMaterialForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/staff/materials", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save material. Please try again.");
        return;
      }

      setSuccess(true);
      form.reset();
      setTimeout(() => {
        window.location.href = "/staff/dashboard/materials";
      }, 1500);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-navy-900">New Study Material</h1>
          <p className="mt-1 text-[14px] font-semibold text-muted">Upload a document or resource for students</p>
        </div>
        <Link
          href="/staff/dashboard/materials"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream shrink-0"
        >
          <Icon name="arrow-left" className="h-4 w-4" />
          Back to materials
        </Link>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-[#CBE7D7] bg-[#F4FCF7] px-4 py-3 text-[12px] font-semibold text-[#167A4A]">
          <Icon name="check" className="h-4 w-4 shrink-0" />
          Material saved successfully. Redirecting…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#F3C6D1] bg-[#FFF1F4] px-4 py-3 text-[12px] font-bold text-[#A32D4A]" role="alert">
          <Icon name="alert-circle" className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <StaffCard title="Basic Information">
          <AdminField label="Material Title *" htmlFor="title" required help="What are you uploading? e.g. 'Chapter 1: Algebra Notes'">
            <input
              id="title"
              name="title"
              type="text"
              required
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
                className={adminSelect}
                disabled={submitting}
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
              placeholder="algebra, worksheet, practice, quadratic"
              disabled={submitting}
            />
          </AdminField>
        </StaffCard>

        <StaffCard title="Upload File">
          <FileUploadField
            name="file_url"
            label="Choose File *"
            kind="file"
            required
            help="PDF, JPG, PNG, WebP — max 12 MB. PDFs are best for documents. Images will be converted to WebP."
          />

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
              className={adminInput}
              disabled={submitting}
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
                Save Material
              </>
            )}
          </button>
        </div>
      </form>
    </div>
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