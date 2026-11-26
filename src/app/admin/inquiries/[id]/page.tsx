import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminInquiry } from "@/lib/admin-data";
import { AdminCard, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { DeleteInquiryButton, InquiryStatusSelect } from "@/components/admin/inquiry-actions";
import { InquiryAutoRead } from "@/components/admin/inquiry-auto-read";
import { Icon } from "@/components/ui/icon";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Enquiry" };

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiryId = Number(id);
  if (!Number.isInteger(inquiryId)) notFound();
  const inquiry = await getAdminInquiry(inquiryId);
  if (!inquiry) notFound();

  const subject = encodeURIComponent(
    `Re: your ${inquiry.type === "admission" ? "admission" : "website"} enquiry — Kids Island Senior Secondary School`
  );
  const mailto = inquiry.email ? `mailto:${inquiry.email}?subject=${subject}` : undefined;
  const tel = inquiry.phone ? `tel:${inquiry.phone.replace(/[^\d+]/g, "")}` : undefined;

  return (
    <div className="flex flex-col gap-5">
      <InquiryAutoRead id={inquiry.id} status={inquiry.status} />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-bold text-muted">
        <Link href="/admin/inquiries" className="transition hover:text-blue">
          Enquiries
        </Link>
        <Icon name="chevron-right" className="h-3 w-3" />
        <span className="text-navy-900">{inquiry.name}</span>
      </nav>

      <AdminPageHeader
        eyebrow={inquiry.type === "admission" ? "Admission enquiry" : "Contact message"}
        title={inquiry.name}
        description={`Received ${formatDateTime(inquiry.created_at)} · Reference #${inquiry.id}`}
      >
        <Link
          href="/admin/inquiries"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="chevron-left" className="h-3.5 w-3.5" />
          All enquiries
        </Link>
        {mailto && (
          <a
            href={mailto}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
          >
            <Icon name="mail" className="h-3.5 w-3.5" />
            Reply by email
          </a>
        )}
      </AdminPageHeader>

      <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
        <div className="flex flex-col gap-4">
          <AdminCard>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Enquiry details</h2>
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.08em]",
                  inquiry.type === "admission" ? "bg-green-200 text-blue" : "bg-cream text-[#8a5a00]"
                )}
              >
                {inquiry.type}
              </span>
            </div>
            <dl className="grid gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-2">
              <Detail label="Student / enquirer" value={inquiry.name} />
              <Detail label="Parent / guardian" value={inquiry.parent_name} />
              <Detail
                label="Email"
                value={
                  inquiry.email ? (
                    <a href={`mailto:${inquiry.email}`} className="text-blue underline decoration-blue/30 underline-offset-2">
                      {inquiry.email}
                    </a>
                  ) : null
                }
              />
              <Detail
                label="Phone"
                value={
                  inquiry.phone ? (
                    <a href={tel} className="text-blue underline decoration-blue/30 underline-offset-2">
                      {inquiry.phone}
                    </a>
                  ) : null
                }
              />
              <Detail label="Class applying for" value={inquiry.class_apply} />
              <Detail label="Current status" value={<StatusBadge status={inquiry.status} />} />
            </dl>
          </AdminCard>

          <AdminCard>
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Message</h2>
            </div>
            <div className="px-5 py-5">
              {inquiry.message ? (
                <p className="whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-navy/80">
                  {inquiry.message}
                </p>
              ) : (
                <p className="text-[12px] font-semibold text-muted">No message was included with this enquiry.</p>
              )}
            </div>
          </AdminCard>

          <AdminCard className="px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Follow-up</p>
                <p className="mt-1 text-[11.5px] font-semibold text-muted">
                  Reply by email or phone, then set the status to <strong className="text-navy">Replied</strong>.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tel && (
                  <a
                    href={tel}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[11px] font-extrabold text-navy transition hover:bg-cream"
                  >
                    <Icon name="phone" className="h-3.5 w-3.5" /> Call
                  </a>
                )}
                {inquiry.email && (
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[11px] font-extrabold text-navy transition hover:bg-cream"
                  >
                    <Icon name="mail" className="h-3.5 w-3.5" /> Email
                  </a>
                )}
                <DeleteInquiryButton id={inquiry.id} name={inquiry.name} redirectTo="/admin/inquiries" />
              </div>
            </div>
          </AdminCard>
        </div>

        <aside className="flex flex-col gap-4">
          <AdminCard className="p-5">
            <h2 className="font-display text-[15.5px] font-semibold text-navy-900">Status</h2>
            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-muted">
              Mark the enquiry as you work through it. The latest status is visible in the inbox.
            </p>
            <div className="mt-3">
              <InquiryStatusSelect id={inquiry.id} status={inquiry.status} className="w-full" />
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <h2 className="font-display text-[15.5px] font-semibold text-navy-900">Metadata</h2>
            <dl className="mt-3 flex flex-col gap-3">
              <MetaRow label="Reference" value={`#${inquiry.id}`} />
              <MetaRow label="Received" value={formatDateTime(inquiry.created_at)} />
              <MetaRow label="Last updated" value={formatDateTime(inquiry.updated_at)} />
              <MetaRow label="Source IP" value={inquiry.ip ?? "Not recorded"} mono />
            </dl>
            <p className="mt-4 rounded-lg bg-paper-2 px-3 py-2.5 text-[10px] font-semibold leading-relaxed text-muted">
              Opening an enquiry is recorded in the audit log. Enquiries contain personal information — handle them
              according to the school&apos;s privacy policy.
            </p>

          </AdminCard>
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-1 text-[12.5px] font-bold text-navy-900">
        {value || <span className="font-semibold text-muted/50">—</span>}
      </dd>
    </div>
  );
}

function MetaRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted">{label}</dt>
      <dd className={cn("text-right text-[11px] font-bold text-navy-900", mono && "font-mono text-[10px] font-semibold")}>
        {value}
      </dd>
    </div>
  );
}
