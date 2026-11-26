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

        <form action={async (formData: FormData) => {
          "use server";
          const db = (await import("@/lib/db")).getDirectDb();
          const { getStaffSession } = await import("@/lib/auth");
          const session = await getStaffSession();
          if (!session) throw new Error("Not authenticated");
          
          const title = formData.get("title") as string;
          const class_level = formData.get("class_level") as string;
          const subject = formData.get("subject") as string;
          const description = formData.get("description") as string;
          const file_url = formData.get("file_url") as string;
          const tags = formData.get("tags") as string;
          const status = formData.get("status") as string;
          const published_at = formData.get("published_at") as string || null;

          if (!title || !class_level || !subject) {
            throw new Error("Please fill in all required fields (Title, Class, Subject).");
          }

          await db.update('materials', {
            title,
            class_level,
            subject,
            description: description || null,
            file_url: file_url || null,
            tags: tags || null,
            status,
            published_at,
            updated_at: new Date().toISOString(),
          }, { id: materialId, created_by: session.user.id });
        }} className="space-y-6">
          <StaffCard title="Basic Information">
            <AdminField label="Material Title *" htmlFor="title" required>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={material.title}
                className={adminInput}
                placeholder="Enter a clear, descriptive title"
              />
            </AdminField>

            <div className="grid gap-5 sm:grid-cols-2">
              <AdminField label="Class / Grade *" htmlFor="class_level" required>
                <select
                  id="class_level"
                  name="class_level"
                  required
                  defaultValue={material.class_level}
                  className={adminSelect}
                >
                  {CLASS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </AdminField>

              <AdminField label="Subject *" htmlFor="subject" required>
                <select
                  id="subject"
                  name="subject"
                  required
                  defaultValue={material.subject}
                  className={adminSelect}
                >
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </AdminField>
            </div>

            <AdminField label="Description" htmlFor="description">
              <textarea
                id="description"
                name="description"
                rows={3}
                className={adminTextarea}
                defaultValue={material.description ?? ""}
                placeholder="e.g. 'Practice worksheet for quadratic equations with step-by-step solutions'"
              />
            </AdminField>

            <AdminField label="Tags" htmlFor="tags" help="Comma-separated keywords for search">
              <input
                id="tags"
                name="tags"
                type="text"
                className={adminInput}
                defaultValue={material.tags ?? ""}
                placeholder="algebra, worksheet, practice, quadratic"
              />
            </AdminField>
          </StaffCard>

          <StaffCard title="File">
            <AdminField label="Current File" htmlFor="file_upload">
              {material.file_url ? (
                <div className="flex items-center gap-3">
                  <Link href={material.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue hover:underline">
                    <Icon name="file" className="h-5 w-5" />
                    <span className="truncate max-w-[300px]">{material.file_url.split("/").pop()}</span>
                  </Link>
                </div>
              ) : (
                <span className="text-muted">No file uploaded</span>
              )}
            </AdminField>

            <AdminField label="Replace File" htmlFor="file_upload" help="Upload a new file to replace the current one (optional)">
              <UploadInput
                id="file_upload"
                value={material.file_url ?? ""}
                onChange={(url) => {}}
                kind="file"
              />
            </AdminField>
          </StaffCard>

          <StaffCard title="Visibility">
            <AdminField label="Status *" htmlFor="status" required>
              <select
                id="status"
                name="status"
                required
                defaultValue={material.status}
                className={adminSelect}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </AdminField>

            <AdminField label="Publish Date" htmlFor="published_at" help="Optional: Schedule when this goes live">
              <input
                id="published_at"
                name="published_at"
                type="date"
                defaultValue={material.published_at?.slice(0, 10) ?? ""}
                className={adminInput}
              />
            </AdminField>
          </StaffCard>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/staff/dashboard/materials"
              className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-5 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
            >
              <Icon name="check" className="h-4 w-4" strokeWidth={2.6} />
              Save Changes
            </button>
          </div>
        </form>
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