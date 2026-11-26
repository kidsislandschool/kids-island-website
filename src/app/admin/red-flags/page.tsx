import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminPageHeader, AdminCard } from "@/components/admin/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Red Flags | Kids Island Admin" },
};

const STATUS_TONES: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const headings = ["Student", "Reason", "Severity", "Assigned By", "Assigned At", "Status", "Actions"];

const rows = [
  {
    id: 1,
    student: { initials: "AK", name: "Amit Kumar", class: "Class 10 - A", admission: "ADM-2024-001" },
    reason: "Repeated disruptive behavior in class despite multiple warnings",
    severity: "high",
    assignedBy: "Admin User",
    assignedAt: "15 Jan 2025, 10:30 AM",
    status: "active",
    actions: (
      <div className="flex items-center justify-end gap-1">
        <button className="inline-flex h-8 items-center gap-1 rounded-md bg-green-100 px-2.5 text-[10.5px] font-extrabold text-green-800 transition hover:bg-green-200">
          <svg className="h-3 w-3" strokeWidth={2.8} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Resolve
        </button>
        <button className="inline-flex h-8 items-center gap-1 rounded-md bg-red-50 px-2.5 text-[10.5px] font-extrabold text-red-700 transition hover:bg-red-100">
          <svg className="h-3.5 w-3.5" strokeWidth={2.5} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v12M7 7h10" /></svg>
          Delete
        </button>
      </div>
    ),
  },
  {
    id: 2,
    student: { initials: "PS", name: "Priya Sharma", class: "Class 8 - B", admission: "ADM-2024-045" },
    reason: "Late submission of assignments repeatedly",
    severity: "low",
    assignedBy: "Admin User",
    assignedAt: "10 Jan 2025, 02:15 PM",
    status: "resolved",
    actions: (
      <div className="flex items-center justify-end gap-1">
        <button className="inline-flex h-8 items-center gap-1 rounded-md bg-green-100 px-2.5 text-[10.5px] font-extrabold text-green-700 transition hover:bg-green-200" title="Reopen">
          <svg className="h-3.5 w-3.5" strokeWidth={2.8} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Reopen
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-red-100 hover:text-red-600" title="Delete">
          <svg className="h-3.5 w-3.5" strokeWidth={2.5} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v12M7 7h10" /></svg>
        </button>
      </div>
    ),
  },
];

function RedFlagsTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
      <table className="w-full min-w-[800px] text-left">
        <thead>
          <tr className="border-b border-line bg-paper-2/60">
            {headings.map((heading) => (
              <th key={heading} className="px-5 py-2.5 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line/70 last:border-0 hover:bg-paper-2/40">
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-blue font-display text-sm font-semibold">
                    {row.student.initials}
                  </span>
                  <div>
                    <span className="block text-[12px] font-extrabold text-navy-900">{row.student.name}</span>
                    <span className="mt-0.5 block max-w-[200px] truncate text-[10.5px] font-semibold text-muted">
                      {row.student.class} | {row.student.admission}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 max-w-[300px]">
                <p className="line-clamp-2 text-[12px] leading-snug text-navy-900">{row.reason}</p>
              </td>
              <td className="px-5 py-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.1em] ${STATUS_TONES[row.severity]}`}>
                  {row.severity.charAt(0).toUpperCase() + row.severity.slice(1)}
                </span>
              </td>
              <td className="px-5 py-3 text-[11.5px] font-semibold text-muted">{row.assignedBy}</td>
              <td className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold text-muted">{row.assignedAt}</td>
              <td className="px-5 py-3">
                {row.status === "active" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10.5px] font-extrabold text-red-700">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10.5px] font-extrabold text-green-700">
                    Resolved
                  </span>
                )}
              </td>
              <td className="px-5 py-3">
                {row.actions}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminRedFlagsPage() {
  const session = await getSession();
  const user = session?.user;
  if (!user || user.role !== "master_admin") redirect("/staff-login");

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Student Discipline"
        title="Red Flags"
        description="Manage disciplinary flags for students. Only admins can assign flags."
        actions={
          <Link
            href="/admin/red-flags/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Red Flag
          </Link>
        }
      />

      <AdminCard>
        <RedFlagsTable />
      </AdminCard>
    </div>
  );
}