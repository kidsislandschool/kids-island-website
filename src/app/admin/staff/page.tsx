import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listStaff, countStaffByStatus } from "@/lib/staff";
import { AdminCard, AdminPageHeader, adminInput, adminSelect, EmptyState, StatusBadge } from "@/components/admin/ui";
import { StaffActionButtons } from "@/components/admin/staff-action-buttons";
import { Icon } from "@/components/ui/icon";
import { Pagination } from "@/components/ui/pagination";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Staff Management" };

export default async function AdminStaffPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const status = params.status && ["pending", "approved", "rejected"].includes(params.status) ? params.status : undefined;
  const q = params.q?.trim() ?? "";
  const page = Math.max(Number(params.page) || 1, 1);
  const result = listStaff({ status, search: q || undefined });
  const counts = countStaffByStatus();
  const total = result.length;
  const perPage = 20;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const paginated = result.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="School content"
        title="Staff Management"
        description="Review and approve staff registrations. Approved staff can access the teacher portal to manage notices and study materials."
      >
        <Link
          href="/staff/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="arrow-up-right" className="h-3.5 w-3.5" /> Staff portal
        </Link>
      </AdminPageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Pending", value: counts.find(c => c.status === "pending")?.c ?? 0, tone: "bg-[#FFF6E3] text-[#9A5B00]" },
          { label: "Approved", value: counts.find(c => c.status === "approved")?.c ?? 0, tone: "bg-[#EAF9F1] text-[#167A4A]" },
          { label: "Rejected", value: counts.find(c => c.status === "rejected")?.c ?? 0, tone: "bg-[#FFF1F4] text-[#A32D4B]" },
          { label: "Total", value: counts.reduce((sum, c) => sum + c.c, 0), tone: "bg-blue-100 text-blue" },
        ].map((tile) => (
          <div key={tile.label} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3.5">
            <div>
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">{tile.label}</p>
              <p className="mt-1 font-display text-[22px] font-semibold leading-none text-navy-900">{tile.value}</p>
            </div>
            <span className={`h-9 w-1.5 rounded-full ${tile.tone}`} />
          </div>
        ))}
      </div>

      <form method="get" className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-3.5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search staff</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search by name, email, designation…"
            className={cn(adminInput, "pl-9")}
          />
        </label>
        <label className="sm:w-40">
          <span className="sr-only">Filter by status</span>
          <select name="status" defaultValue={status ?? ""} className={adminSelect}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="inline-flex h-10 items-center justify-center rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700">Apply</button>
          {(q || status) && <Link href="/admin/staff" className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-3 text-[11.5px] font-extrabold text-navy transition hover:bg-cream">Reset</Link>}
        </div>
      </form>

      <AdminCard className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon="user-group" title="No staff found" text={q || status ? "Try clearing the filters." : "No staff registrations yet."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-line bg-paper-2/60">
                  {["Staff Member", "Contact", "Designation", "Status", "Registered", ""].map((heading, i) => (
                    <th key={heading} className={`px-4 py-3 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted ${i === 5 ? "text-right" : ""}`}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((staff) => (
                  <tr key={staff.id} className="border-b border-line/70 last:border-0 hover:bg-paper-2/40">
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="block text-[13px] font-bold text-navy-900">{staff.name}</span>
                        <span className="mt-0.5 text-[11px] font-semibold text-muted">{staff.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {staff.phone && <span className="block text-[12px] font-semibold text-muted">{staff.phone}</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      {staff.designation ? (
                        <span className="text-[12px] font-semibold text-muted">{staff.designation}</span>
                      ) : (
                        <span className="text-[11px] text-muted/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={staff.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[11px] font-semibold text-muted">{formatDateTime(staff.created_at)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <StaffActionButtons staffId={staff.id} name={staff.name} status={staff.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <Pagination page={page} pages={pages} basePath="/admin/staff" searchParams={{ status: status || undefined, q: q || undefined }} />
    </div>
  );
}