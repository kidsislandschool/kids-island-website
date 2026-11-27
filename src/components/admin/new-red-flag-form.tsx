"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { AdminCard, AdminCardHeader, AdminField, adminInput, adminSelect, adminTextarea } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NewRedFlagFormProps {
  students: Array<{
    id: number;
    first_name: string;
    last_name: string;
    class: string;
    section: string;
    admission_number: string;
  }>;
}

export function NewRedFlagForm({ students }: NewRedFlagFormProps) {
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
      const res = await fetch("/api/admin/red-flags", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to create red flag");

      redirect("/admin/red-flags");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create red flag");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AdminCard>
        <AdminCardHeader title="Student Details" />
        <AdminField label="Student *" htmlFor="student_id" required>
          <select id="student_id" name="student_id" required className="adminSelect">
            <option value="">Select a student…</option>
            {students.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name} — {s.class} {s.section} ({s.admission_number})
              </option>
            ))}
          </select>
        </AdminField>
      </AdminCard>

      <AdminCard>
        <AdminCardHeader title="Flag Details" />
        <AdminField label="Reason *" htmlFor="reason" required>
          <textarea
            id="reason"
            name="reason"
            required
            rows={4}
            className="adminTextarea"
            placeholder="Describe the reason for this red flag…"
          />
        </AdminField>

        <AdminField label="Severity *" htmlFor="severity" required>
          <select id="severity" name="severity" required className="adminSelect" defaultValue="medium">
            <option value="low">Low — Minor infraction</option>
            <option value="medium">Medium — Repeated or moderate issue</option>
            <option value="high">High — Serious behavioral concern</option>
            <option value="critical">Critical — Severe violation requiring immediate action</option>
          </select>
        </AdminField>
      </AdminCard>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#F3C6D1] bg-[#FFF1F4] px-4 py-3 text-[12px] font-bold text-[#A32D4A]" role="alert">
          <Icon name="alert-circle" className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/admin/red-flags"
          className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={submitting} className="ml-auto">
          {submitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="none" stroke="currentColor" strokeWidth="4" d="M4 12a8 8 0 018-8V0" /></svg>
              Creating…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Create Red Flag
            </>
          )}
        </Button>
      </div>
    </form>
  );
}