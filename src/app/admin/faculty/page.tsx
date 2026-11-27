import type { Metadata } from "next";
import Link from "next/link";
import { CollectionScreen } from "@/components/admin/collection-screen";
import { FacultyApprovals, type StaffRequest } from "@/components/admin/faculty-approvals";
import { FacultyProfileApprovals } from "@/components/admin/faculty-profile-approvals";
import { Icon } from "@/components/ui/icon";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Faculty" };

export default async function AdminFacultyPage() {
  // Fetch pending staff sign-up requests
  const { data: pendingStaffData, error: staffError } = await supabaseAdmin
    .from("staff")
    .select("id, name, email, phone, designation, qualification, bio, photo, status, created_at, approved_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (staffError) {
    console.error("Failed to load pending staff:", staffError);
  }

  const pendingStaff = (pendingStaffData ?? []) as StaffRequest[];

  // Fetch faculty profiles needing review (requested by staff for public display)
  const { data: pendingFacultyData, error: facultyError } = await supabaseAdmin
    .from("faculty")
    .select("id, name, email, designation, qualification, bio, photo, subjects, status, created_at, updated_at")
    .eq("status", "needs_review")
    .order("updated_at", { ascending: false });

  if (facultyError) {
    console.error("Failed to load pending faculty:", facultyError);
  }

  const pendingFaculty = (pendingFacultyData ?? []) as StaffRequest[];

  return (
    <CollectionScreen
      collectionKey="faculty"
      eyebrow="School content"
      description="Approve staff access requests and publish faculty profiles. Approving a teacher here creates their public faculty card automatically."
      actions={
        <>
          <Link
            href="/admin/staff"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
          >
            <Icon name="user-group" className="h-3.5 w-3.5" />
            Staff accounts
          </Link>
          <Link
            href="/faculty"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
          >
            <Icon name="eye" className="h-3.5 w-3.5" />
            View public page
          </Link>
        </>
      }
      notice={
        <>
          <FacultyApprovals initialPending={pendingStaff} />
          {pendingFaculty.length > 0 && <FacultyProfileApprovals initialPending={pendingFaculty} />}
        </>
      }
      emptyMessage="No profiles yet — approve a staff request above, or add a profile manually. The public faculty page shows an empty state until the first profile is published."
    />
  );
}
