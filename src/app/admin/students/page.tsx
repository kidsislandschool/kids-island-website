import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCollectionDef, getCollectionRows } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui";
import { CollectionManager } from "@/components/admin/collection-manager";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const user = await requireAdmin();
  if (!user) notFound();

  const def = getCollectionDef("students");
  if (!def) notFound();

  const initial = await getCollectionRows("students", { perPage: 50 });

  // Fetch red flag counts for all students
  const { data: redFlags } = await supabaseAdmin
    .from("red_flags")
    .select("student_id, resolved")
    .eq("resolved", false);

  const redFlagCounts = new Map<number, number>();
  redFlags?.forEach((rf) => {
    const count = redFlagCounts.get(rf.student_id) || 0;
    redFlagCounts.set(rf.student_id, count + 1);
  });

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Student Directory"
        title="Students"
        description="Manage student records and view disciplinary flags."
        actions={
          <a
            href="/admin/red-flags/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Red Flag
          </a>
        }
      />

      <CollectionManager
        collectionKey="students"
        def={def}
        initialRows={initial.rows}
        initialTotal={initial.total}
        customColumns={(row) => {
          const studentId = row.id as number;
          const flagCount = redFlagCounts.get(studentId) || 0;
          if (flagCount > 0) {
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10.5px] font-extrabold text-red-700">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {flagCount}
              </span>
            );
          }
          return null;
        }}
      />
    </div>
  );
}