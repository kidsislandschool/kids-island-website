import type { Metadata } from "next";
import Link from "next/link";
import { auditEntities, listAudit } from "@/lib/audit";
import { AdminCard, AdminPageHeader, adminInput, adminSelect, EmptyState } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { Pagination } from "@/components/ui/pagination";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Audit log" };

const PER_PAGE = 40;

const QUICK_FILTERS = [
  { label: "All", action: "" },
  { label: "Sign-ins", action: "login" },
  { label: "Content", action: "content" },
  { label: "Publishing", action: "publish" },
  { label: "Enquiries", action: "inquiry" },
  { label: "Uploads", action: "upload" },
  { label: "Deletions", action: "delete" },
];

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity?: string; page?: string }>;
}) {
  const params = await searchParams;
  const action = params.action?.trim() ?? "";
  const entity = params.entity?.trim() ?? "";
  const page = Math.max(Number(params.page) || 1, 1);
  const result = listAudit({
    action: action || undefined,
    entity: entity || undefined,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });
  const entities = auditEntities();
  const pages = Math.max(1, Math.ceil(result.total / PER_PAGE));

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="System"
        title="Audit log"
        description="A chronological record of sign-ins, content changes, publishing, uploads, deletions and enquiry access."
      >
        <Link
          href="/admin"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="dashboard" className="h-3.5 w-3.5" />
          Dashboard
        </Link>
      </AdminPageHeader>

      <div className="flex flex-wrap gap-1.5">
        {QUICK_FILTERS.map((filter) => {
          const active = action === filter.action && !entity;
          const href = filter.action
            ? `/admin/audit-log?action=${encodeURIComponent(filter.action)}`
            : "/admin/audit-log";
          return (
            <Link
              key={filter.label}
              href={href}
              className={cn(
                "inline-flex h-8 items-center rounded-lg border px-3 text-[10.5px] font-extrabold transition",
                active
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-white text-navy hover:border-blue/25 hover:bg-blue-100/40"
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <form method="get" className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-3.5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Filter by action</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="action"
            defaultValue={action}
            type="search"
            placeholder="Filter by action, e.g. login, notice, upload…"
            className={cn(adminInput, "pl-9")}
          />
        </label>
        <label className="sm:w-52">
          <span className="sr-only">Filter by entity</span>
          <select name="entity" defaultValue={entity} className={adminSelect}>
            <option value="">All entities</option>
            {entities.map((entry) => (
              <option key={entry.entity} value={entry.entity}>
                {entry.entity} ({entry.count})
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
          >
            Apply
          </button>
          {(action || entity) && (
            <Link
              href="/admin/audit-log"
              className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-3 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      <p className="text-[11px] font-bold text-muted" aria-live="polite">
        {result.total.toLocaleString("en-IN")} recorded action{result.total === 1 ? "" : "s"} · page {page} of {pages}
      </p>

      <AdminCard className="overflow-hidden">
        {result.rows.length === 0 ? (
          <EmptyState icon="clock" title="No audit entries found" text="Try clearing the filters. Actions appear here as soon as they happen." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-line bg-paper-2/60">
                  {["When", "Who", "Action", "Entity", "IP", "Detail"].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-line/70 last:border-0 align-top hover:bg-paper-2/40">
                    <td className="whitespace-nowrap px-4 py-3 text-[10.5px] font-semibold text-muted">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="block text-[11px] font-extrabold text-navy-900">{row.name ?? "System"}</span>
                      <span className="mt-0.5 block text-[9.5px] font-semibold text-muted">
                        {row.user_id ? `User #${row.user_id}` : "No user"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-1 text-[9.5px] font-extrabold",
                          actionTone(row.action)
                        )}
                      >
                        {row.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10.5px] font-bold text-navy/70">
                      {row.entity ?? "—"}
                      {row.entity_id ? <span className="text-muted"> #{row.entity_id}</span> : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-[9.5px] font-semibold text-muted">{row.ip ?? "—"}</td>
                    <td className="max-w-[300px] px-4 py-3">
                      {row.detail ? (
                        <details className="group">
                          <summary className="cursor-pointer list-none text-[10px] font-extrabold text-blue marker:hidden">
                            <span className="group-open:hidden">View detail</span>
                            <span className="hidden group-open:inline">Hide detail</span>
                          </summary>
                          <pre className="mt-1.5 max-h-52 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-paper-2 p-2.5 font-mono text-[9px] leading-relaxed text-navy/70">
                            {prettyJson(row.detail)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-[10px] text-muted/50">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <Pagination
        page={page}
        pages={pages}
        basePath="/admin/audit-log"
        searchParams={{ action: action || undefined, entity: entity || undefined }}
      />
    </div>
  );
}

function prettyJson(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function actionTone(action: string) {
  if (action === "login") return "border-[#CBE7D7] bg-[#EAF9F1] text-[#167A4A]";
  if (action === "login_failed") return "border-[#F3C6D1] bg-[#FFF1F4] text-[#A32D4B]";
  if (action === "logout") return "border-line bg-paper-2 text-muted";
  if (action.includes("delete")) return "border-[#F3C6D1] bg-[#FFF1F4] text-[#A32D4B]";
  if (action.includes("publish")) return "border-[#CBE7D7] bg-[#EAF9F1] text-[#167A4A]";
  if (action.includes("upload")) return "border-[#c9f0d6] bg-green-200 text-blue";
  if (action.includes("content") || action.includes("settings") || action.includes("password")) {
    return "border-[#F2DDB0] bg-[#FFF6E3] text-[#9A5B00]";
  }
  return "border-line bg-white text-navy";
}
