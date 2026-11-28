import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listStaff, countStaffByStatus } from "@/lib/staff";
import { AdminPageHeader, AdminCard, AdminStat, EmptyState, StatusBadge } from "@/components/admin/ui";
import { DeleteStaffButton } from "@/components/admin/staff-actions";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn, formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Staff Accounts | Kids Island Admin" },
};

export default async function AdminStaffPage() {
  const session = await getSession();
  const user = session?.user;
  if (!user || user.role !== "master_admin") redirect("/staff-login");

  const [counts, staffList] = await Promise.all([
    countStaffByStatus(),
    listStaff({}),
  ]);

  const stats = {
    pending: counts.find((c) => c.status === "pending")?.c ?? 0,
    approved: counts.find((c) => c.status === "approved")?.c ?? 0,
    rejected: counts.find((c) => c.status === "rejected")?.c ?? 0,
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Staff Accounts"
        description="Teacher portal accounts. Approve or reject new sign-ups from the Faculty screen so access is granted and the public profile is published together."
      >
        <Link
          href="/admin/faculty"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="user-check" className="h-3.5 w-3.5" />
          Review staff requests
        </Link>
        <Link
          href="/staff-signup"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="plus" className="h-3.5 w-3.5" />
          View sign-up page
        </Link>
      </AdminPageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AdminStat
          label="Pending approval"
          value={stats.pending}
          icon="alert-triangle"
          tone="yellow"
          hint="Awaiting review"
        />
        <AdminStat
          label="Approved"
          value={stats.approved}
          icon="user-check"
          tone="mint"
          hint="Active teacher accounts"
        />
        <AdminStat
          label="Rejected"
          value={stats.rejected}
          icon="user-x"
          tone="pink"
          hint="Declined requests"
        />
        <AdminStat
          label="Total"
          value={staffList.length}
          icon="users"
          tone="blue"
        />
      </div>

      <AdminCard>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Staff Accounts</h2>
            <p className="mt-0.5 text-[11.5px] font-semibold text-muted">
              Teacher portal access requests. Approve to grant dashboard access.
            </p>
          </div>
        </div>

        {staffList.length === 0 ? (
          <EmptyState
            icon="users"
            title="No staff accounts yet"
            text="Teacher sign-ups will appear here. Approve them to grant portal access."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-line bg-paper-2/60">
                  {["Name", "Email", "Designation", "Status", "Requested", "Actions"].map((heading) => (
                    <th key={heading} className="px-5 py-2.5 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id} className="border-b border-line/70 last:border-0 hover:bg-paper-2/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-blue font-display text-sm font-semibold">
                          {staff.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <span className="block text-[12px] font-extrabold text-navy-900">{staff.name}</span>
                          {staff.designation && (
                            <span className="mt-0.5 block max-w-[200px] truncate text-[10.5px] font-semibold text-muted">
                              {staff.designation}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[11.5px] font-semibold text-muted">{staff.email}</td>
                    <td className="px-5 py-3 text-[11.5px] font-semibold text-muted">{staff.designation ?? "—"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={staff.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold text-muted">
                      {formatDateTime(staff.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {staff.status === "pending" ? (
                          <Link
                            href="/admin/faculty"
                            className="inline-flex h-8 items-center gap-1 rounded-md bg-[#FFF6E3] px-2.5 text-[10.5px] font-extrabold text-[#9A5B00] transition hover:bg-[#FFECCC]"
                            title="Approve from the Faculty screen"
                          >
                            <Icon name="alert-triangle" className="h-3 w-3" />
                            Review in Faculty
                          </Link>
                        ) : (
                          <span className="text-[10.5px] font-bold text-muted">
                            {staff.status === "approved" ? "Active" : "Declined"}
                          </span>
                        )}
                        <DeleteStaffButton
                          id={staff.id}
                          name={staff.name}
                          email={staff.email}
                          status={staff.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}