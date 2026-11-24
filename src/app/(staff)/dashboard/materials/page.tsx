import type { Metadata } from "next";
import Link from "next/link";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStaffMaterials } from "@/lib/data";
import { StaffShell } from "@/components/staff/staff-shell";
import { Icon } from "@/components/ui/icon";
import { formatDate, formatDateTime } from "@/lib/utils";
import { AdminCard, adminInput, adminSelect, EmptyState, StatusBadge } from "@/components/admin/ui";
import { Pagination } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Study Materials" };

export default async function StaffMaterialsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const session = await getStaffSession();
  if (!session) redirect("/staff-login");

  const params = await searchParams;
  const status = params.status && ["published", "draft", "needs_review"].includes(params.status) ? params.status : undefined;
  const page = Math.max(Number(params.page) || 1, 1);
  const result = getStaffMaterials({ staffId: session.user.id, status, page, perPage: 15 });

  return (
    <StaffShell user={{ name: session.user.name, email: session.user.email }}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[24px] font-semibold text-navy-900">My Study Materials</h1>
            <p className="mt-1 text-[13px] font-semibold text-muted">Upload and manage notes, PDFs, and assignments for students.</p>
          </div>
          <Link
            href="/staff/dashboard/materials/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[12px] font-extrabold text-white transition hover:bg-navy-700"
          >
            <Icon name="plus" className="h-4 w-4" /> Add New Material
          </Link>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Published", value: "published", tone: "bg-[#EAF9F1] text-[#167A4A]" },
            { label: "Draft", value: "draft", tone: "bg-paper-2 text-muted" },
            { label: "Needs Review", value: "needs_review", tone: "bg-[#FFF6E3] text-[#9A5B00]" },
          ].map((s) => (
            <Link
              key={s.value}
              href={s.value ? `/staff/dashboard/materials?status=${s.value}` : "/staff/dashboard/materials"}
              className={`inline-flex h-8 items-center rounded-lg border px-3 text-[10.5px] font-extrabold transition ${
                status === s.value ? `border-navy bg-navy text-white` : `border-line bg-white text-navy hover:border-blue/25 hover:bg-blue-100/40`
              }`}
            >
              {s.label}
              {result.rows.filter(r => r.status === s.value).length > 0 && (
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[9px]">{result.rows.filter(r => r.status === s.value).length}</span>
              )}
            </Link>
          ))}
        </div>

        <AdminCard className="overflow-hidden">
          {result.rows.length === 0 ? (
            <EmptyState
              icon="book"
              title={status ? `No ${status} materials` : "No study materials yet"}
              text={status ? "Try changing the status filter." : "Upload your first study material to get started."}
            >
              <Link
                href="/staff/dashboard/materials/new"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-3.5 text-[11.5px] font-extrabold text-white"
              >
                <Icon name="plus" className="h-3.5 w-3.5" /> Upload Material
              </Link>
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left">
                <thead>
                  <tr className="border-b border-line bg-paper-2/60">
                    {["Material", "Class", "Subject", "Status", "Uploaded", ""].map((heading, i) => (
                      <th key={heading} className={`px-4 py-3 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted ${i === 5 ? "text-right" : ""}`}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((material) => (
                    <tr key={material.id} className="border-b border-line/70 last:border-0 hover:bg-paper-2/40">
                      <td className="px-4 py-3.5">
                        <Link href={`/study-materials`} target="_blank" rel="noopener noreferrer" className="block">
                          <span className="block text-[13px] font-bold text-navy-900 line-clamp-1">{material.title}</span>
                          <span className="mt-0.5 text-[11px] font-semibold text-muted">{material.description?.slice(0, 80)}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] font-semibold text-muted">{material.class_level}</td>
                      <td className="px-4 py-3.5 text-[12px] font-semibold text-muted">{material.subject}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={material.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[11px] font-semibold text-muted">{formatDateTime(material.created_at)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Link href={`/staff/dashboard/materials/${material.id}/edit`} className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue hover:underline">
                          <Icon name="edit" className="h-3.5 w-3.5" /> Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>

        <Pagination page={result.page} pages={result.pages} basePath="/staff/dashboard/materials" searchParams={{ status }} />
      </div>
    </StaffShell>
  );
}