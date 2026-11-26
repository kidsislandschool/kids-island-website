import type { Metadata } from "next";
import Link from "next/link";
import { adminInquiryCounts, getAdminInquiries } from "@/lib/admin-data";
import { AdminCard, AdminPageHeader, AdminStat, EmptyState, StatusBadge } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admissions" };

export default async function AdminAdmissionsPage() {
  const [latest, counts] = await Promise.all([
    getAdminInquiries({ type: "admission", perPage: 6 }),
    adminInquiryCounts(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Admissions"
        title="Admissions desk"
        description="Review admission enquiries, follow up with families and keep track of the admission pipeline."
      >
        <Link
          href="/admissions"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="eye" className="h-3.5 w-3.5" />
          View public page
        </Link>
        <Link
          href="/admin/inquiries?type=admission"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="mail" className="h-3.5 w-3.5" />
          Enquiry inbox
        </Link>
      </AdminPageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AdminStat label="New admission enquiries" value={counts.new} icon="mail" href="/admin/inquiries?type=admission&status=new" tone="yellow" />
        <AdminStat label="Replied" value={counts.replied} icon="check-circle" href="/admin/inquiries?type=admission&status=replied" tone="mint" />
        <AdminStat label="Admission enquiries" value={counts.admission} icon="graduation" href="/admin/inquiries?type=admission" tone="blue" />
        <AdminStat label="Contact messages" value={counts.contact} icon="mail" href="/admin/inquiries?type=contact" tone="pink" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <AdminCard>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Latest admission enquiries</h2>
              <p className="mt-0.5 text-[11.5px] font-semibold text-muted">
                Submitted from the form on the admissions page.
              </p>
            </div>
            <Link href="/admin/inquiries?type=admission" className="text-[11.5px] font-extrabold text-blue">
              View all →
            </Link>
          </div>
          {latest.rows.length === 0 ? (
            <EmptyState
              icon="graduation"
              title="No admission enquiries yet"
              text="When a family submits the admission form, their details will appear here and in the inquiry inbox."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead>
                  <tr className="border-b border-line bg-paper-2/60">
                    {["Family", "Class", "Status", "Received"].map((heading) => (
                      <th key={heading} className="px-5 py-2.5 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {latest.rows.map((inquiry) => (
                    <tr key={inquiry.id} className="border-b border-line/70 last:border-0 hover:bg-paper-2/40">
                      <td className="px-5 py-3">
                        <Link href={`/admin/inquiries/${inquiry.id}`} className="block">
                          <span className="block text-[12px] font-extrabold text-navy-900">{inquiry.name}</span>
                          <span className="mt-0.5 block max-w-[220px] truncate text-[10.5px] font-semibold text-muted">
                            {inquiry.phone ?? inquiry.email ?? "No contact detail"}
                          </span>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[11px] font-bold text-navy/70">
                        {inquiry.class_apply ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={inquiry.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[10.5px] font-semibold text-muted">
                        {formatDateTime(inquiry.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>

        <div className="flex flex-col gap-4">
          <AdminCard>
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Enquiry shortcuts</h2>
              <p className="mt-0.5 text-[11.5px] font-semibold text-muted">Jump straight to the messages you need.</p>
            </div>
            <ul className="divide-y divide-line/70">
              {[
                { label: "All admission enquiries", value: counts.admission, href: "/admin/inquiries?type=admission", icon: "graduation" as const },
                { label: "New, not yet read", value: counts.new, href: "/admin/inquiries?type=admission&status=new", icon: "mail" as const },
                { label: "Replied", value: counts.replied, href: "/admin/inquiries?type=admission&status=replied", icon: "check-circle" as const },
                { label: "Contact messages", value: counts.contact, href: "/admin/inquiries?type=contact", icon: "info" as const },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-paper-2/50">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-green-200 text-blue">
                      <Icon name={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-[12px] font-extrabold text-navy-900">{item.label}</span>
                    <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-extrabold text-muted">{item.value}</span>
                    <Icon name="chevron-right" className="h-4 w-4 shrink-0 text-navy/20" />
                  </Link>
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard className="bg-navy p-5 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-yellow">
              <Icon name="check-circle" className="h-4 w-4" />
            </span>
            <h2 className="mt-3 font-display text-[16px] font-semibold text-white">Before confirming admission details</h2>
            <ul className="mt-2.5 space-y-2 text-[11px] font-semibold leading-relaxed text-white/60">
              <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-yellow" />Confirm fee and seat-availability language with the school office.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-yellow" />Verify the phone and email shown on the page.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-yellow" />Resolve the affiliation/eligibility contradiction.</li>
            </ul>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
