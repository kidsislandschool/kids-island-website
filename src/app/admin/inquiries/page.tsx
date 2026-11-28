import type { Metadata } from "next";
import Link from "next/link";
import { adminInquiryCounts, getAdminInquiries } from "@/lib/admin-data";
import { AdminCard, AdminPageHeader, adminInput, adminSelect, EmptyState } from "@/components/admin/ui";
import { Pagination } from "@/components/ui/pagination";
import { DeleteInquiryButton, InquiryStatusSelect } from "@/components/admin/inquiry-actions";
import { Icon } from "@/components/ui/icon";
import { cn, formatDateTime, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Inquiries" };

type Search = {
  type?: string;
  status?: string;
  q?: string;
  page?: string;
};

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const type = params.type === "admission" || params.type === "contact" ? params.type : undefined;
  const status =
    params.status && ["new", "read", "replied", "closed"].includes(params.status) ? params.status : undefined;
  const q = params.q?.trim() ?? "";
  const page = Math.max(Number(params.page) || 1, 1);

  const [result, counts] = await Promise.all([
    getAdminInquiries({ type, status, search: q || undefined, page, perPage: 20 }),
    adminInquiryCounts(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Admissions"
        title="Inquiries"
        description="Admission inquiries and contact messages submitted from the public site. Update statuses as your team follows up."
      >
        <Link
          href="/admin/admissions"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="graduation" className="h-3.5 w-3.5" />
          Admissions desk
        </Link>
        <a
          href="/admin/inquiries?status=new"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="mail" className="h-3.5 w-3.5" />
          {counts.new} new
        </a>
      </AdminPageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "All inquiries", value: counts.total, href: "/admin/inquiries", active: !type },
          { label: "Admission", value: counts.admission, href: "/admin/inquiries?type=admission", active: type === "admission" },
          { label: "Contact", value: counts.contact, href: "/admin/inquiries?type=contact", active: type === "contact" },
          { label: "Unread / new", value: counts.new, href: "/admin/inquiries?status=new", active: status === "new" && !type },
        ].map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className={cn(
              "rounded-2xl border px-4 py-3.5 transition",
              tile.active
                ? "border-navy bg-navy text-white shadow-soft"
                : "border-line bg-white text-navy hover:border-blue/25 hover:bg-blue-100/30"
            )}
          >
            <p className={cn("text-[9.5px] font-extrabold uppercase tracking-[0.12em]", tile.active ? "text-white/50" : "text-muted")}>
              {tile.label}
            </p>
            <p className={cn("mt-1 font-display text-[24px] font-semibold leading-none", tile.active ? "text-yellow" : "text-navy-900")}>
              {tile.value}
            </p>
          </Link>
        ))}
      </div>

      <form method="get" className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-3.5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search inquiries</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search by name, email, phone or message…"
            className={cn(adminInput, "pl-9")}
          />
        </label>
        <label className="sm:w-40">
          <span className="sr-only">Filter by type</span>
          <select name="type" defaultValue={type ?? ""} className={adminSelect}>
            <option value="">All types</option>
            <option value="admission">Admission</option>
            <option value="contact">Contact</option>
          </select>
        </label>
        <label className="sm:w-40">
          <span className="sr-only">Filter by status</span>
          <select name="status" defaultValue={status ?? ""} className={adminSelect}>
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
          >
            Apply
          </button>
          {(q || type || status) && (
            <Link
              href="/admin/inquiries"
              className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-3 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      <p className="text-[11px] font-bold text-muted" aria-live="polite">
        {result.total} inquir{result.total === 1 ? "y" : "ies"}
        {q ? ` matching “${q}”` : ""} · page {result.page} of {result.pages}
      </p>

      <AdminCard className="overflow-hidden">
        {result.rows.length === 0 ? (
          <EmptyState
            icon="mail"
            title="No inquiries found"
            text={q || type || status ? "Try clearing the filters or using a different search term." : "Submissions from the admission and contact forms will appear here."}
          >
            {(q || type || status) && (
              <Link
                href="/admin/inquiries"
                className="inline-flex h-9 items-center rounded-lg bg-navy px-3.5 text-[11.5px] font-extrabold text-white"
              >
                Clear filters
              </Link>
            )}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead>
                <tr className="border-b border-line bg-paper-2/60">
                  {["Inquirer", "Type", "Message", "Status", "Received", ""].map((heading, index) => (
                    <th
                      key={heading || index}
                      className={cn(
                        "px-4 py-3 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted",
                        index === 5 && "text-right"
                      )}
                    >
                      {heading || <span className="sr-only">Actions</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-line/70 last:border-0 hover:bg-paper-2/40">
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/inquiries/${inquiry.id}`} className="block">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[12px] font-extrabold text-navy-900">{inquiry.name}</span>
                          {inquiry.status === "new" && (
                            <span className="rounded-full bg-yellow px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-[0.06em] text-navy-900">
                              New
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-[10.5px] font-semibold text-muted">
                          {inquiry.parent_name ? `Parent: ${inquiry.parent_name} · ` : ""}
                          {inquiry.email ?? inquiry.phone ?? "No contact detail"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.06em]",
                          inquiry.type === "admission" ? "bg-green-200 text-blue" : "bg-cream text-[#8a5a00]"
                        )}
                      >
                        {inquiry.type}
                      </span>
                      {inquiry.class_apply && (
                        <span className="mt-1 block text-[10px] font-bold text-muted">{inquiry.class_apply}</span>
                      )}
                    </td>
                    <td className="max-w-[300px] px-4 py-3.5 text-[11px] font-semibold leading-relaxed text-muted">
                      {inquiry.message ? truncate(inquiry.message, 95) : <span className="text-muted/50">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <InquiryStatusSelect id={inquiry.id} status={inquiry.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[10.5px] font-semibold text-muted">
                      {formatDateTime(inquiry.created_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/inquiries/${inquiry.id}`}
                          aria-label={`View inquiry from ${inquiry.name}`}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-green-200 hover:text-blue"
                        >
                          <Icon name="eye" className="h-3.5 w-3.5" />
                        </Link>
                        <DeleteInquiryButton id={inquiry.id} name={inquiry.name} compact />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <Pagination
        page={result.page}
        pages={result.pages}
        basePath="/admin/inquiries"
        searchParams={{ type, status, q: q || undefined }}
      />
    </div>
  );
}
