import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminPageHeader, AdminCard, AdminField, adminInput, adminSelect, adminTextarea } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { supabaseAdmin } from "@/lib/supabase";
import { getDirectDb } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/audit";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "New Red Flag | Kids Island Admin" },
};

export default async function NewRedFlagPage() {
  const session = await getSession();
  const user = session?.user;
  if (!user || user.role !== "master_admin") redirect("/staff-login");

  const db = getDirectDb();
  const students = await db.select('students', '*', { status: 'active' }).order('first_name', { ascending: true });

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

      <form action={async (formData: FormData) => {
        "use server";
        const db = (await import("@/lib/db")).getDirectDb();
        const { getSession } = await import("@/lib/auth");
        const { logAudit } = await import("@/lib/audit");
        const { clientIp } = await import("@/lib/audit");
        const session = await getSession();
        if (!session) throw new Error("Not authenticated");

        const studentId = Number(formData.get("student_id"));
        const reason = formData.get("reason") as string;
        const severity = formData.get("severity") as string;

        if (!studentId || !reason) {
          throw new Error("Student and reason are required");
        }

        const { data: redFlag, error } = await (await import("@/lib/supabase")).supabaseAdmin
          .from("red_flags")
          .insert({
            student_id: studentId,
            reason: formData.get("reason") as string,
            severity: formData.get("severity") as string,
            assigned_by: session.user.id,
          })
          .select()
          .single();

        if (error) throw error;

        await logAudit({
          userId: session.user.id,
          action: "red_flag_created",
          entity: "red_flags",
          entityId: redFlag.id,
          detail: { studentId, reason: formData.get("reason") },
          ip: "server",
        });

        redirect(`/admin/red-flags`);
      }} className="space-y-6">
        <AdminCard title="Student Details">
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

        <AdminCard title="Flag Details">
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