import type { Metadata } from "next";
import { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { getContent } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { getMaterials, getMaterialClassLevels, getMaterialSubjects } from "@/lib/data";
import { PageHero } from "@/components/sections/page-hero";
import { Icon } from "@/components/ui/icon";
import { MaterialsExplorer } from "./MaterialsExplorer";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return await buildPageMetadata("/study-materials", {
    title: "Study Materials",
    description: "Curated notes, assignments and learning resources from Kids Island Senior Secondary School.",
  });
}

async function getInitialMaterials(sp: { q?: string; classLevel?: string; subject?: string; page?: string }): Promise<{
  rows: any[];
  page: number;
  pages: number;
  total: number;
}> {
  const { q: search, classLevel, subject, page = "1", perPage = 9 } = sp;
  const pageNum = parseInt(page, 10) || 1;
  
  let query = supabaseAdmin
    .from('materials')
    .select('*', { count: 'exact' })
    .eq('status', 'published');
  
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (classLevel) {
    query = query.eq('class_level', classLevel);
  }
  if (subject) {
    query = query.eq('subject', subject);
  }
  
  query = query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range((pageNum - 1) * perPage, pageNum * perPage - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error('getMaterials error:', error);
    return { rows: [], page: pageNum, pages: 0, total: 0 };
  }
  if (!Array.isArray(data)) {
    return { rows: [], page: pageNum, pages: 0, total: 0 };
  }
  
  return {
    rows: data,
    page: pageNum,
    pages: Math.ceil((count ?? 0) / perPage),
    total: count ?? 0,
  };
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
    Promise.all([
      getMaterialClassLevels(),
      getMaterialSubjects(),
    ]),
  ]);
  
  return (
    <MaterialsExplorer
      initialMaterials={initialResult.rows}
      classLevels={filters[0]}
      subjects={filters[1]}
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
