import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminPageHeader, AdminCard, AdminCardHeader, AdminField, adminInput, adminSelect, adminTextarea } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { NewRedFlagForm } from "@/components/admin/new-red-flag-form";

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

      <NewRedFlagForm students={students} />
    </div>
  );
}