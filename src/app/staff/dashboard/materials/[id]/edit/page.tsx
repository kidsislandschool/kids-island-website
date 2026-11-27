import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDirectDb } from "@/lib/db";
import { getStaffMaterials } from "@/lib/data";
import { StaffShell } from "@/components/staff/staff-shell";
import { Icon } from "@/components/ui/icon";
import { UploadInput } from "@/components/admin/upload-input";
import { AdminField, adminInput, adminSelect, adminTextarea } from "@/components/admin/ui";
import { cn, formatDateTime } from "@/lib/utils";
import { EditMaterialForm } from "@/components/staff/edit-material-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Material" };

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
  { value: "published", label: "Published — Students can see it" },
  { value: "draft", label: "Draft — Saved, not visible" },
  { value: "needs_review", label: "Needs Review — Pending approval" },
];

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session) redirect("/staff-login");

  const { id } = await params;
  const materialId = Number(id);
  if (!Number.isInteger(materialId)) notFound();

  const db = getDirectDb();
  const material = await db.selectOne('materials', '*', { id: materialId, created_by: session.user.id }) as
    | { id: number; title: string; class_level: string; subject: string; description: string | null; file_url: string | null; tags: string | null; status: string; published_at: string | null; created_at: string; updated_at: string }
    | undefined;

  if (!material) notFound();

  return (
    <StaffShell user={{ name: session.user.name, email: session.user.email }}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/staff/dashboard/materials" className="inline-flex items-center gap-1.5 text-blue hover:underline text-[11.5px] font-extrabold">
              <Icon name="arrow-left" className="h-4 w-4" /> Back to materials
            </Link>
            <h1 className="mt-1 font-display text-[24px] font-semibold text-navy-900">Edit Study Material</h1>
            <p className="mt-1 text-[13px] font-semibold text-muted">Make changes and save. Updated on {formatDateTime(material.updated_at)}.</p>
          </div>
        </div>

        <EditMaterialForm material={material} />
      </div>
    </StaffShell>
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