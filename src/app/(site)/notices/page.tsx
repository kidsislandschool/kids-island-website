import type { Metadata } from "next";
import Link from "next/link";
import { getNotices, getNoticeCategories } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Pagination } from "@/components/ui/pagination";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildPageMetadata("/notices", {
    title: "Notices & Announcements",
    description: "Latest notices, events and announcements from Kids Island Senior Secondary School, Aligarh.",
  });
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const result = getNotices({ search: sp.q, category: sp.category, page: Number(sp.page) || 1, perPage: 9 });
  const categories = getNoticeCategories();

  return (
    <>
      <PageHero
        tone="blue"
        breadcrumb="Notices"
        eyebrow="Notice board"
        title={<>Stay in the <span className="wave-underline">loop</span></>}
        intro="Announcements, events and important dates — published by the school office and always up to date."
      />

      <section className="bg-paper py-16 sm:py-20" aria-label="Notices">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <form action="/notices" method="get" className="relative w-full max-w-md">
              <span className="sr-only">Search notices</span>
              <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Search notices…"
                type="search"
                className="h-12 w-full rounded-xl border border-line bg-white pl-10 pr-24 text-[14px] font-semibold text-navy shadow-sm outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/10"
              />
              {sp.category && <input type="hidden" name="category" value={sp.category} />}
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 h-9 rounded-lg bg-navy px-4 text-[12px] font-extrabold text-white transition hover:bg-navy-700"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/notices"
                className={cn(
                  "rounded-full px-3.5 py-2 text-[11.5px] font-extrabold transition",
                  !sp.category ? "bg-navy text-white" : "border border-line bg-white text-navy/65 hover:bg-cream"
                )}
              >
                All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/notices?category=${encodeURIComponent(category)}`}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[11.5px] font-extrabold transition",
                    sp.category === category ? "bg-navy text-white" : "border border-line bg-white text-navy/65 hover:bg-cream"
                  )}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>

          {result.rows.length === 0 ? (
            <Reveal className="mt-10">
              <div className="flex flex-col items-center gap-5 rounded-[2rem] border-2 border-dashed border-line bg-white/60 px-6 py-16 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-3xl bg-cream text-amber">
                  <Icon name="megaphone" className="h-7 w-7" />
                </span>
                <div>
                  <h2 className="text-xl text-navy-900">
                    {result.total > 0 ? "No notices match your search" : "No notices published yet"}
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-muted">
                    {result.total > 0
                      ? "Try a different keyword or category, or view all notices."
                      : "Announcements will appear here as soon as the school office publishes them."}
                  </p>
                </div>
                <Button href="/notices" variant="outline" size="sm">
                  View all notices
                </Button>
              </div>
            </Reveal>
          ) : (
            <>
              <RevealGroup className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {result.rows.map((notice) => {
                  const date = notice.event_date ?? notice.published_at ?? notice.created_at;
                  const d = new Date(date.includes("T") ? date : `${date}T00:00:00`);
                  const day = Number.isNaN(d.getTime()) ? "•" : d.getDate();
                  const month = Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN", { month: "short" });
                  return (
                    <RevealItem key={notice.id} className="h-full">
                      <Link
                        href={`/notices/${notice.id}`}
                        className="group flex h-full flex-col rounded-[1.5rem] border border-line bg-white p-5 shadow-[0_16px_40px_-34px_rgba(18,50,92,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-blue/25 hover:shadow-soft"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-cream leading-none">
                            <span className="font-display text-xl font-semibold text-navy-900">{day}</span>
                            <span className="mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-amber">{month}</span>
                          </div>
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-extrabold text-blue">
                              {notice.category}
                            </span>
                            {notice.pinned ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-extrabold text-[#8a5a00]">
                                <Icon name="pin" className="h-2.5 w-2.5" /> Pinned
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <h2 className="mt-4 text-[17px] leading-snug text-navy-900 transition-colors group-hover:text-blue">
                          {notice.title}
                        </h2>
                        {notice.summary && (
                          <p className="mt-2 line-clamp-3 flex-1 text-[12.5px] leading-relaxed text-muted">{notice.summary}</p>
                        )}
                        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                          <span className="text-[10.5px] font-bold text-muted">
                            {formatDate(notice.published_at ?? notice.created_at)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue">
                            Read
                            <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </Link>
                    </RevealItem>
                  );
                })}
              </RevealGroup>
              <Pagination
                page={result.page}
                pages={result.pages}
                basePath="/notices"
                searchParams={{ q: sp.q, category: sp.category }}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
