import type { Metadata } from "next";
import { Suspense } from "react";
import { getContent } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { Icon } from "@/components/ui/icon";
import { siteOrigin } from "@/lib/site-url";
import { MaterialsExplorer } from "./MaterialsExplorer";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return await buildPageMetadata("/study-materials", {
    title: "Study Materials",
    description: "Curated notes, assignments and learning resources from Kids Island Senior Secondary School.",
  });
}

const SITE_URL = siteOrigin();

async function getMaterialFilters(): Promise<{ classLevels: string[]; subjects: string[] }> {
  try {
    const res = await fetch(`${SITE_URL}/api/filters/materials`, { next: { revalidate: 300 } });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Failed to fetch material filters:", e);
  }
  return { classLevels: [], subjects: [] };
}

async function getInitialMaterials(sp: { q?: string; classLevel?: string; subject?: string; page?: string }): Promise<{
  rows: any[];
  page: number;
  pages: number;
  total: number;
}> {
  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.classLevel) params.set("classLevel", sp.classLevel);
  if (sp.subject) params.set("subject", sp.subject);
  params.set("page", sp.page || "1");
  params.set("perPage", "9");

  try {
    const res = await fetch(`${SITE_URL}/api/study-materials?${params.toString()}`, { next: { revalidate: 60 } });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Failed to fetch materials:", e);
  }
  return { rows: [], page: 1, pages: 0, total: 0 };
}

/** Streams filters + list so the hero paints immediately. */
async function MaterialsContent({
  q,
  classLevel,
  subject,
  page,
}: {
  q?: string;
  classLevel?: string;
  subject?: string;
  page?: string;
}) {
  const [initialResult, filters] = await Promise.all([
    getInitialMaterials({ q, classLevel, subject, page }),
    getMaterialFilters(),
  ]);

  return (
    <MaterialsExplorer
      initialMaterials={initialResult.rows}
      classLevels={filters.classLevels}
      subjects={filters.subjects}
      currentPage={initialResult.page}
      totalPages={initialResult.pages}
      total={initialResult.total}
      initialQ={q}
      initialClassLevel={classLevel}
      initialSubject={subject}
    />
  );
}

function MaterialsSkeleton() {
  return (
    <div aria-hidden>
      <div className="h-28 animate-pulse rounded-[1.5rem] border border-line bg-navy/[0.04]" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 rounded-[1.5rem] border border-line bg-navy/[0.04]" />
        ))}
      </div>
    </div>
  );
}

type MaterialsPage = { title: string; intro: string; emptyState: string };

export default async function StudyMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classLevel?: string; subject?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const content = await getContent<MaterialsPage>("materials.page", {
    title: "Resource Center",
    intro: "Access curated study notes, assignments, and educational resources designed to support your learning journey.",
    emptyState: "No study materials have been published yet.",
  });

  return (
    <>
      <PageHero
        tone="mint"
        breadcrumb="Study Materials"
        eyebrow="Resource center"
        title={<>A library that <span className="wave-underline">travels home</span></>}
        intro={content.intro}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-green-200 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue">
          <Icon name="book" className="h-5 w-5" /> Resources
        </span>
      </PageHero>

      <section className="relative bg-paper py-16 sm:py-20" aria-label="Study resources">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Suspense fallback={<MaterialsSkeleton />}>
            <MaterialsContent q={sp.q} classLevel={sp.classLevel} subject={sp.subject} page={sp.page} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
