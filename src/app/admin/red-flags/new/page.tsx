import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminPageHeader, AdminCard, AdminCardHeader, AdminField, adminInput, adminSelect, adminTextarea } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "New Red Flag | Kids Island Admin" },
};

export default async function NewRedFlagPage() {
  const session = await getSession();
  const user = session?.user;
  if (!user || user.role !== "master_admin") redirect("/staff-login");

  const { data: studentData, error: studentError } = await supabaseAdmin
    .from("students")
    .select("id, first_name, last_name, class, section, admission_number")
    .eq("status", "published")
    .order("class_order", { ascending: true, nullsFirst: false })
    .order("first_name", { ascending: true })
    .limit(2000);

  if (studentError) {
    console.error("Failed to load students:", studentError);
  }

  const students = studentData ?? [];

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-navy-900">New Red Flag</h1>
          <p className="mt-1 text-[14px] font-semibold text-muted">Assign a disciplinary flag to a student</p>
        </div>
        <Link
          href="/admin/red-flags"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Red Flags
        </Link>
      </div>

      <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            try {
              const res = await fetch("/api/admin/red-flags", {
                method: "POST",
                body: formData,
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(data.error ?? "Failed to create red flag");
              redirect("/admin/red-flags");
            } catch (err) {
              alert(err instanceof Error ? err.message : "Failed to create red flag");
            }
          }} className="space-y-6">
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

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/red-flags"
            className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
          >
            Cancel
          </Link>
          <button type="submit" className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-5 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Create Red Flag
          </button>
        </div>
      </form>
    </div>
  );
}