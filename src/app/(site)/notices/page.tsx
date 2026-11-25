import type { Metadata } from "next";
import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { siteOrigin } from "@/lib/site-url";
import { NoticeList } from "./NoticeList";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return await buildPageMetadata("/notices", {
    title: "Notices & Announcements",
    description: "Latest notices, events and announcements from Kids Island Senior Secondary School, Aligarh.",
  });
}

const SITE_URL = siteOrigin();

async function getNoticeCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${SITE_URL}/api/filters/notices`, { next: { revalidate: 300 } });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Failed to fetch notice categories:", e);
  }
  return [];
}

async function getInitialNotices(sp: { q?: string; category?: string; page?: string }): Promise<{
  rows: any[];
  page: number;
  pages: number;
  total: number;
}> {
  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.category) params.set("category", sp.category);
  params.set("page", sp.page || "1");
  params.set("perPage", "9");

  try {
    const res = await fetch(`${SITE_URL}/api/notices?${params.toString()}`, { next: { revalidate: 60 } });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Failed to fetch notices:", e);
  }
  return { rows: [], page: 1, pages: 0, total: 0 };
}

/** Streams the list so the hero paints immediately. */
async function NoticeContent({
  q,
  category,
  page,
}: {
  q?: string;
  category?: string;
  page?: string;
}) {
  const sp = { q, category, page };
  const [initialResult, categories] = await Promise.all([
    getInitialNotices(sp),
    getNoticeCategories(),
  ]);

  return (
    <NoticeList
      initialNotices={initialResult.rows}
      categories={categories}
      currentCategory={category}
      currentPage={initialResult.page}
      totalPages={initialResult.pages}
      total={initialResult.total}
      searchQuery={q}
    />
  );
}

function NoticeSkeleton() {
  return (
    <div aria-hidden>
      <div className="flex animate-pulse flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="h-12 w-full max-w-md rounded-xl bg-navy/[0.06]" />
        <div className="flex gap-2">
          <div className="h-8 w-14 rounded-full bg-navy/[0.06]" />
          <div className="h-8 w-24 rounded-full bg-navy/[0.06]" />
          <div className="h-8 w-20 rounded-full bg-navy/[0.06]" />
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 rounded-[1.5rem] border border-line bg-navy/[0.04]" />
        ))}
      </div>
    </div>
  );
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const sp = await searchParams;

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
          <Suspense fallback={<NoticeSkeleton />}>
            <NoticeContent q={sp.q} category={sp.category} page={sp.page} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
