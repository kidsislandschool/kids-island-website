import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCollectionDef, getCollectionRows } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui";
import { StudentsManager } from "@/components/admin/students-manager";
import { Icon } from "@/components/ui/icon";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Students | Kids Island Admin" },
};

export default async function AdminStudentsPage() {
  const user = await requireAdmin();
  if (!user) notFound();

  const def = getCollectionDef("students");
  if (!def) notFound();

  const [initial, flagsResult] = await Promise.all([
    getCollectionRows("students", { perPage: 50 }),
    supabaseAdmin
      .from("red_flags")
      .select("id, student_id, reason, severity, assigned_at, resolved, resolution_note")
      .eq("resolved", false)
      .order("assigned_at", { ascending: false })
      .then((r) => ({ data: r.data, error: r.error })),
  ]);

  const flags = flagsResult.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Student directory"
        title="Students"
        description="Search the full student roll, filter by class or section, add or remove records, and assign red flags. Red flags are visible to administrators only."
      >
        <Link
          href="/admin/red-flags"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="alert-triangle" className="h-3.5 w-3.5 text-[#C23B5A]" />
          All red flags
        </Link>
      </AdminPageHeader>

      <StudentsManager
        def={def}
        initialRows={initial.rows}
        initialTotal={initial.total}
        initialFlags={flags}
      />
    </div>
  );
}
