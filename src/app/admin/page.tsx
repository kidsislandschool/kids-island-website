import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { adminCounts, adminInquiryCounts, getAdminInquiries } from "@/lib/admin-data";

import { AdminCard, AdminPageHeader, AdminStat, EmptyState, StatusBadge } from "@/components/admin/ui";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Dashboard | Kids Island Admin" },
};

const QUICK_ACTIONS: { label: string; href: string; icon: IconName; hint: string }[] = [
  { label: "Publish a notice", href: "/admin/notices", icon: "megaphone", hint: "Events & announcements" },
  { label: "Add a faculty profile", href: "/admin/faculty", icon: "user-group", hint: "Published profiles" },
  { label: "Upload study material", href: "/admin/materials", icon: "book", hint: "PDFs & resources" },
  { label: "Manage gallery", href: "/admin/gallery", icon: "image", hint: "Albums & photos" },
];

export default async function AdminDashboardPage() {
  const session = await getSession();
  const user = session?.user;
  const firstName = user?.name.split(" ")[0] ?? "there";
  const [counts, inquiryStats, recentInquiriesResult] = await Promise.all([
    adminCounts(),
    adminInquiryCounts(),
    getAdminInquiries({ perPage: 5 }),
  ]);
  const recentInquiries = recentInquiriesResult.rows;
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
          New inquiries
          {counts.inquiriesNew > 0 && (
            <span className="ml-0.5 rounded-full bg-yellow px-1.5 py-0.5 text-[9.5px] font-extrabold text-navy-900">
              {counts.inquiriesNew}
            </span>
          )}
        </Link>
      </AdminPageHeader>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <AdminStat label="New inquiries" value={inquiryStats.new} icon="mail" href="/admin/inquiries?status=new" tone="blue" hint={`${inquiryStats.total} in total`} />
        <AdminStat label="Published notices" value={counts.noticesPublished} icon="megaphone" href="/admin/notices" tone="pink" />
        <AdminStat label="Faculty profiles" value={counts.facultyPublished} icon="user-group" href="/admin/faculty" tone="mint" />
        <AdminStat label="Study materials" value={counts.materialsPublished} icon="book" href="/admin/materials" tone="blue" />
        <AdminStat label="Gallery photos" value={counts.photos} icon="image" href="/admin/gallery" tone="navy" hint={`${counts.albums} album${counts.albums === 1 ? "" : "s"}`} />
        <AdminStat label="Awaiting review" value={counts.testimonialsReview + counts.faqsReview} icon="alert-triangle" href="/admin/testimonials" tone="yellow" hint="Testimonials & FAQs" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        {/* latest inquiries */}
        <AdminCard>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-[16.5px] font-semibold text-navy-900">Latest inquiries</h2>
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
              title="No inquiries yet"
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

    </div>
  );
}
