"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { adminSelect } from "./ui";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

export function InquiryStatusSelect({
  id,
  status,
  className,
}: {
  id: number;
  status: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function update(next: string) {
    const previous = value;
    setValue(next);
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setValue(previous);
        setError(data.error ?? "Could not update.");
        return;
      }
      router.refresh();
    } catch {
      setValue(previous);
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <span className="relative inline-flex items-center">
        <select
          value={value}
          onChange={(e) => void update(e.target.value)}
          disabled={saving}
          aria-label="Inquiry status"
          className={cn(adminSelect, "h-8 w-[118px] text-[11px] font-extrabold", className)}
        >
          {STATUSES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {saving && (
          <span className="pointer-events-none absolute right-7 h-3 w-3 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
        )}
      </span>
      {error && <span className="text-[9.5px] font-bold text-[#C23B5A]">{error}</span>}
    </span>
  );
}

export function DeleteInquiryButton({
  id,
  name,
  redirectTo,
  compact = false,
}: {
  id: number;
  name: string;
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not delete.");
        return;
      }
      setOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      setError("Network error while deleting.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Delete inquiry from ${name}`}
          className="grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-[#FFF1F4] hover:text-[#A32D4B]"
        >
          <Icon name="trash" className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#F3C6D1] bg-[#FFF1F4] px-3 text-[11.5px] font-extrabold text-[#A32D4B] transition hover:bg-[#FCE4EA]"
        >
          <Icon name="trash" className="h-3.5 w-3.5" />
          Delete inquiry
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-navy-900/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Delete inquiry"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FFF1F4] text-[#A32D4B]">
                <Icon name="alert-triangle" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-[17px] font-semibold text-navy-900">Delete this inquiry?</h2>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  The enquiry from <strong className="text-navy">{name}</strong> will be permanently removed. This cannot be undone.
                </p>
              </div>
            </div>
            {error && <p className="mt-3 text-[11px] font-bold text-[#C23B5A]">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void remove()}
                disabled={deleting}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C23B5A] px-4 text-[11.5px] font-extrabold text-white transition hover:bg-[#A32D4B] disabled:opacity-50"
              >
                <Icon name="trash" className="h-3.5 w-3.5" />
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
