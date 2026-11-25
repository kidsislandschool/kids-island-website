import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { adminCounts } from "@/lib/admin-data";
import { getInquiries } from "@/lib/data";
import { getContentRecord, listContent } from "@/lib/content";
import { CONTENT_SCHEMAS } from "@/lib/content-schema";

import { AdminCard, AdminPageHeader, AdminStat, EmptyState, StatusBadge } from "@/components/admin/ui";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn, formatDateTime, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Dashboard | Kids Island Admin" },
};

const QUICK_ACTIONS: { label: string; href: string; icon: IconName; hint: string }[] = [
  { label: "Edit homepage hero", href: "/admin/content/home.hero", icon: "edit", hint: "Headline, CTAs, slides" },
  { label: "Publish a notice", href: "/admin/notices", icon: "megaphone", hint: "Events & announcements" },
  { label: "Add a faculty profile", href: "/admin/faculty", icon: "user-group", hint: "Published profiles" },
  { label: "Upload study material", href: "/admin/materials", icon: "book", hint: "PDFs & resources" },
  { label: "Manage gallery", href: "/admin/gallery", icon: "image", hint: "Albums & photos" },
];

export default async function AdminDashboardPage() {
  const session = await getSession();
  const user = session?.user;
  const firstName = user?.name.split(" ")[0] ?? "there";
  const [counts, recentInquiriesResult, allContent] = await Promise.all([
    adminCounts(),
    getInquiries({ perPage: 5 }),
    listContent(),
  ]);
  const recentInquiries = Array.isArray(recentInquiriesResult?.rows) ? recentInquiriesResult.rows : [];
  const reviewBlocks = Array.isArray(allContent) ? allContent.filter((block) => block.status === "needs_review").slice(0, 6) : [];
  const [affiliation, eligibility] = await Promise.all([
    getContentRecord("settings.affiliation"),
    getContentRecord("admissions.eligibility"),
  ]);
  const affiliationNeedsReview = affiliation?.status !== "published";
  const eligibilityNeedsReview = eligibility?.status !== "published";
  const hasConflict = affiliationNeedsReview || eligibilityNeedsReview;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow={today}
        title={`${greeting}, ${firstName}.`}
        description="Here is what needs your attention across the website today."
      >
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
          View website
        </Link>
        <Link
          href="/admin/inquiries?status=new"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="mail" className="h-3.5 w-3.5" />
          New enquiries
          {counts.inquiriesNew > 0 && (
            <span className="ml-0.5 rounded-full bg-yellow px-1.5 py-0.5 text-[9.5px] font-extrabold text-navy-900">
              {counts.inquiriesNew}
            </span>
          )}
        </Link>
      </AdminPageHeader>

      {/* conflict / review callout */}
      {hasConflict && (
        <section
          aria-label="Content review required"
          className="overflow-hidden rounded-2xl border border-[#F2DDB0] bg-[#FFF9EE]"
        >
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FFE9B8] text-[#8a5a00]">
              <Icon name="alert-triangle" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[17px] font-semibold text-[#6b4400]">
                Verify before publishing
              </h2>
              <p className="mt-1 max-w-3xl text-[12.5px] font-semibold leading-relaxed text-[#7A5200]">
                The current website claims <strong>UP Board affiliation</strong>, while the admissions content
                references <strong>CBSE age guidelines</strong>. These items stay hidden from the public site until
                you confirm the correct position and publish them.
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                <Link
                  href="/admin/content/settings.affiliation"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#8a5a00] px-3 text-[10.5px] font-extrabold text-white transition hover:bg-[#6b4400]"
                >
                  <Icon name="edit" className="h-3 w-3" /> Affiliation claim
                  <StatusBadge status={affiliation?.status ?? "draft"} className="ml-1 border-white/20 bg-white/15 text-white" />
                </Link>
                <Link
                  href="/admin/content/admissions.eligibility"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E5C77E] bg-white px-3 text-[10.5px] font-extrabold text-[#7A5200] transition hover:bg-[#FFF4D6]"
                >
                  <Icon name="edit" className="h-3 w-3" /> Eligibility rules
                  <StatusBadge status={eligibility?.status ?? "draft"} className="ml-1 border-[#E5C77E] bg-white" />
                </Link>
                <Link
                  href="/admin/content?status=needs_review"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E5C77E] bg-white px-3 text-[10.5px] font-extrabold text-[#7A5200] transition hover:bg-[#FFF4D6]"
                >
                  <Icon name="clock" className="h-3 w-3" /> All content to review ({counts.contentReview})
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <AdminStat label="New enquiries" value={counts.inquiriesNew} icon="mail" href="/admin/inquiries?status=new" tone="blue" hint={`${counts.inquiriesTotal} in total`} />
        <AdminStat label="Content to review" value={counts.contentReview} icon="clock" href="/admin/content?status=needs_review" tone="yellow" hint="Hidden until published" />
        <AdminStat label="Published notices" value={counts.noticesPublished} icon="megaphone" href="/admin/notices" tone="pink" />
        <AdminStat label="Faculty profiles" value={counts.facultyPublished} icon="user-group" href="/admin/faculty" tone="mint" />
        <AdminStat label="Study materials" value={counts.materialsPublished} icon="book" href="/admin/materials" tone="blue" />
        <AdminStat label="Gallery photos" value={counts.photos} icon="image" href="/admin/gallery" tone="navy" hint={`${counts.albums} album${counts.albums === 1 ? "" : "s"}`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        {/* latest enquiries */}
        <AdminCard>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Latest enquiries</h2>
              <p className="mt-0.5 text-[11.5px] font-semibold text-muted">
                Admission and contact submissions from the public forms.
              </p>
            </div>
            <Link href="/admin/inquiries" className="text-[11.5px] font-extrabold text-blue">
              View all →
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <EmptyState
              icon="mail"
              title="No enquiries yet"
              text="Admission and contact form submissions will appear here as soon as they arrive."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-line bg-paper-2/60">
                    {["Name", "Type", "Status", "Received"].map((heading) => (
                      <th key={heading} className="px-5 py-2.5 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="border-b border-line/70 last:border-0 hover:bg-paper-2/40">
                      <td className="px-5 py-3">
                        <Link href={`/admin/inquiries/${inquiry.id}`} className="block">
                          <span className="block text-[12px] font-extrabold text-navy-900">{inquiry.name}</span>
                          <span className="mt-0.5 block max-w-[230px] truncate text-[10.5px] font-semibold text-muted">
                            {inquiry.email ?? inquiry.phone ?? "No contact detail"}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.08em]",
                            inquiry.type === "admission" ? "bg-green-200 text-blue" : "bg-cream text-[#8a5a00]"
                          )}
                        >
                          {inquiry.type}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={inquiry.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold text-muted">
                        {formatDateTime(inquiry.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>

        {/* review queue */}
        <AdminCard>
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Review queue</h2>
              <p className="mt-0.5 text-[11.5px] font-semibold text-muted">Unverified content, hidden publicly.</p>
            </div>
            <Link href="/admin/content?status=needs_review" className="text-[11.5px] font-extrabold text-blue">
              View all →
            </Link>
          </div>
          {reviewBlocks.length === 0 ? (
            <EmptyState icon="check-circle" title="Everything is reviewed" text="No content blocks are waiting for review." />
          ) : (
            <ul className="divide-y divide-line/70">
              {reviewBlocks.map((block) => {
                const schema = CONTENT_SCHEMAS[block.key];
                return (
                  <li key={block.key}>
                    <Link
                      href={`/admin/content/${encodeURIComponent(block.key)}`}
                      className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-paper-2/60"
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#FFF6E3] text-[#9A5B00]">
                        <Icon name="clock" className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-extrabold text-navy-900">
                          {schema?.label ?? block.key}
                        </span>
                        <span className="mt-0.5 block truncate text-[10.5px] font-semibold text-muted">
                          {schema?.group ?? "Content"} · {block.key}
                        </span>
                      </span>
                      <Icon name="chevron-right" className="mt-1 h-4 w-4 shrink-0 text-navy/20" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="border-t border-line bg-paper-2/40 px-5 py-3">
            <Link
              href="/admin/testimonials"
              className="flex items-center justify-between text-[11px] font-extrabold text-navy"
            >
              <span>Testimonials awaiting approval</span>
              <span className="rounded-full bg-[#FFF6E3] px-2 py-0.5 text-[10px] text-[#9A5B00]">
                {counts.testimonialsReview}
              </span>
            </Link>
            <Link
              href="/admin/faqs"
              className="mt-2.5 flex items-center justify-between text-[11px] font-extrabold text-navy"
            >
              <span>FAQs awaiting approval</span>
              <span className="rounded-full bg-[#FFF6E3] px-2 py-0.5 text-[10px] text-[#9A5B00]">{counts.faqsReview}</span>
            </Link>
          </div>
        </AdminCard>
      </div>

      {/* quick actions */}
      <section aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="font-display text-[16.5px] font-semibold text-navy-900">
          Quick actions
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col rounded-2xl border border-line bg-white p-4 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] transition hover:-translate-y-0.5 hover:border-blue/25 hover:shadow-soft"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-200 text-blue transition group-hover:bg-navy group-hover:text-yellow">
                <Icon name={action.icon} className="h-4 w-4" />
              </span>
              <span className="mt-3 text-[11.5px] font-extrabold leading-snug text-navy-900">{action.label}</span>
              <span className="mt-0.5 text-[10px] font-semibold text-muted">{action.hint}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* recent activity */}
      <AdminCard>
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Recent admin activity</h2>
            <p className="mt-0.5 text-[11.5px] font-semibold text-muted">Every save, publish, upload and sign-in is recorded.</p>
          </div>
        </div>
        <EmptyState icon="clock" title="No activity yet" text="Admin actions will be listed here." />
      </AdminCard>
    </div>
  );
}

function prettyAction(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function actionIcon(action: string): IconName {
  if (action.startsWith("login")) return "lock";
  if (action.startsWith("logout")) return "logout";
  if (action.includes("delete")) return "trash";
  if (action.includes("upload")) return "image";
  if (action.includes("publish")) return "check-circle";
  if (action.includes("inquiry")) return "mail";
  if (action.includes("content") || action.includes("settings")) return "edit";
  return "clock";
}
