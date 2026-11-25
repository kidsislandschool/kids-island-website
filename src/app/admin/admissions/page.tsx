import type { Metadata } from "next";
import Link from "next/link";
import { getContentRecord } from "@/lib/content";
import { getDb } from "@/lib/db";
import { getInquiries } from "@/lib/data";
import { CONTENT_SCHEMAS } from "@/lib/content-schema";
import { AdminCard, AdminPageHeader, AdminStat, EmptyState, StatusBadge } from "@/components/admin/ui";
import { Icon, type IconName } from "@/components/ui/icon";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admissions" };

const CONTENT_LINKS: { key: string; note: string; icon: IconName }[] = [
  {
    key: "admissions.page",
    note: "Process steps, documents, class list and admission contact details.",
    icon: "file",
  },
  {
    key: "admissions.eligibility",
    note: "Age and transfer rules. Currently flagged for review.",
    icon: "user-group",
  },
  {
    key: "settings.affiliation",
    note: "UP Board vs CBSE affiliation claim. Must be verified.",
    icon: "shield",
  },
];

export default async function AdminAdmissionsPage() {
  const latest = getInquiries({ type: "admission", perPage: 6 });
  const statusRows = getDb()
    .prepare("SELECT status, COUNT(*) AS c FROM inquiries WHERE type = 'admission' GROUP BY status")
    .all() as { status: string; c: number }[];
  const statusCount = (status: string) => statusRows.find((row) => row.status === status)?.c ?? 0;
  const totalAdmissions = statusRows.reduce((sum, row) => sum + row.c, 0);
  const contactTotal = (
    getDb().prepare("SELECT COUNT(*) AS c FROM inquiries WHERE type = 'contact'").get() as { c: number }
  ).c;
  const affiliation = getContentRecord("settings.affiliation");
  const eligibility = getContentRecord("admissions.eligibility");
  const needsVerification = affiliation?.status !== "published" || eligibility?.status !== "published";

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Admissions"
        title="Admissions desk"
        description="Review admission enquiries, keep the admission page accurate and publish only verified eligibility rules."
      >
        <Link
          href="/admin/inquiries?type=admission"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="mail" className="h-3.5 w-3.5" />
          Enquiry inbox
        </Link>
        <Link
          href="/admin/content/admissions.page"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="edit" className="h-3.5 w-3.5" />
          Edit admission page
        </Link>
      </AdminPageHeader>

      {needsVerification && (
        <section className="flex flex-col gap-3 rounded-2xl border border-[#F2DDB0] bg-[#FFF9EE] p-4 sm:flex-row sm:items-center">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FFE9B8] text-[#8a5a00]">
            <Icon name="alert-triangle" className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[12px] font-extrabold text-[#7A5200]">Affiliation and eligibility conflict is still open</p>
            <p className="mt-0.5 text-[11px] font-semibold leading-relaxed text-[#7A5200]/85">
              The current website says UP Board affiliated; the admissions content mentions CBSE age guidelines.
              Confirm the correct position, update both blocks, then publish them.
            </p>
          </div>
          <Link
            href="/admin/content/settings.affiliation"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#8a5a00] px-3 text-[10.5px] font-extrabold text-white transition hover:bg-[#6b4400]"
          >
            Review claim <Icon name="arrow-right" className="h-3 w-3" />
          </Link>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AdminStat label="New admission enquiries" value={statusCount("new")} icon="mail" href="/admin/inquiries?type=admission&status=new" tone="yellow" />
        <AdminStat label="Replied" value={statusCount("replied")} icon="check-circle" href="/admin/inquiries?type=admission&status=replied" tone="mint" />
        <AdminStat label="Admission enquiries" value={totalAdmissions} icon="graduation" href="/admin/inquiries?type=admission" tone="blue" />
        <AdminStat label="Contact messages" value={contactTotal} icon="mail" href="/admin/inquiries?type=contact" tone="pink" />
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
              text="When a family submits the admission form, their details will appear here and in the enquiry inbox."
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
              <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Admission page content</h2>
              <p className="mt-0.5 text-[11.5px] font-semibold text-muted">Edit the copy shown to families.</p>
            </div>
            <ul className="divide-y divide-line/70">
              {CONTENT_LINKS.map(({ key, note, icon }) => {
                const schema = CONTENT_SCHEMAS[key];
                const record = getContentRecord(key);
                return (
                  <li key={key}>
                    <Link
                      href={`/admin/content/${encodeURIComponent(key)}`}
                      className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-paper-2/50"
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-green-200 text-blue">
                        <Icon name={icon} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-[12px] font-extrabold text-navy-900">{schema?.label ?? key}</span>
                          <StatusBadge status={record?.status ?? "draft"} />
                        </span>
                        <span className="mt-0.5 block text-[10.5px] font-semibold leading-snug text-muted">{note}</span>
                      </span>
                      <Icon name="chevron-right" className="mt-1.5 h-4 w-4 shrink-0 text-navy/20" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </AdminCard>

          <AdminCard className="bg-navy p-5 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-yellow">
              <Icon name="check-circle" className="h-4 w-4" />
            </span>
            <h2 className="mt-3 font-display text-[16px] font-semibold text-white">Before publishing admission details</h2>
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
