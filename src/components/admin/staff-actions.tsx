"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Modal } from "./collection-manager";

export function DeleteStaffButton({
  id,
  name,
  email,
  status,
}: {
  id: number;
  name: string;
  email: string;
  status: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function confirmDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not delete this staff account.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-[#F3C6D1] bg-[#FFF1F4] px-2.5 text-[10.5px] font-extrabold text-[#A32D4B] transition hover:bg-[#FFE3E9]"
        title={`Delete ${name}'s account`}
      >
        <Icon name="trash" className="h-3 w-3" />
        Delete
      </button>

      <Modal
        open={open}
        onClose={() => {
          if (!deleting) setOpen(false);
        }}
        title="Delete this staff account?"
        width="max-w-md"
      >
        <div className="px-5 py-5">
          <p className="text-[13px] leading-relaxed text-muted">
            <strong className="text-navy-900">{name}</strong>{" "}
            <span className="text-[12px]">({email})</span> will lose access to the teacher
            portal immediately and their sign-in sessions will be revoked.
          </p>
          <ul className="mt-3 space-y-1.5 text-[12px] font-semibold text-muted">
            <li className="flex gap-2">
              <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#167A4A]" />
              Staff account and active sessions are removed permanently.
            </li>
            <li className="flex gap-2">
              <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#167A4A]" />
              Uploaded study materials stay on the site (author is cleared).
            </li>
            <li className="flex gap-2">
              <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue" />
              A linked public faculty profile is unpublished, not erased — edit it from the
              Faculty screen.
            </li>
          </ul>
          {status === "pending" && (
            <p className="mt-3 rounded-lg bg-[#FFF6E3] px-3 py-2 text-[11.5px] font-bold text-[#9A5B00]">
              This request is still pending. Deleting it declines the sign-up.
            </p>
          )}
          {error && (
            <div
              className="mt-4 flex items-center gap-2 rounded-xl border border-[#F3C6D1] bg-[#FFF1F4] px-4 py-3 text-[12px] font-bold text-[#A32D4A]"
              role="alert"
            >
              <Icon name="alert-circle" className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={deleting}
              className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream disabled:opacity-50"
            >
              Keep account
            </button>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              disabled={deleting}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C23B5A] px-4 text-[11.5px] font-extrabold text-white transition hover:bg-[#A32D4B] disabled:opacity-50"
            >
              <Icon name="trash" className="h-3.5 w-3.5" />
              {deleting ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
