import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getContent } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { getMaterials } from "@/lib/data";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { MaterialFilters } from "@/components/forms/material-filters";
import { Pagination } from "@/components/ui/pagination";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { SceneArt } from "@/components/ui/scene-art";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildPageMetadata("/study-materials", {
    title: "Study Materials",
    description: "Curated notes, assignments and learning resources from Kids Island Senior Secondary School.",
  });
}

type MaterialsPage = { title: string; intro: string; emptyState: string };

export default async function StudyMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classLevel?: string; subject?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const content = getContent<MaterialsPage>("materials.page", {
    title: "Resource Center",
    intro: "Access curated study notes, assignments, and educational resources designed to support your learning journey.",
    emptyState: "No study materials have been published yet.",
  });
  const result = getMaterials({
    search: sp.q,
    classLevel: sp.classLevel,
    subject: sp.subject,
    page: Number(sp.page) || 1,
    perPage: 9,
  });

  return (
    <>
      <PageHero
        tone="blue"
        breadcrumb="Study Materials"
        eyebrow="Resource center"
        title={<>A library that <span className="wave-underline">travels home</span></>}
        intro={content.intro}
      />

      <section className="relative bg-paper py-16 sm:py-20" aria-label="Study resources">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Suspense fallback={<div className="h-28 rounded-[1.5rem] border border-line bg-white" />}>
            <MaterialFilters classLevels={result.classLevels} subjects={result.subjects} />
          </Suspense>

          {result.rows.length === 0 ? (
            <Reveal className="mt-8">
              <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] border border-line bg-white p-6 shadow-soft sm:p-10 lg:grid-cols-[1fr_0.8fr]">
                <div>
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-blue">
                    <Icon name="book" className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.1rem)] leading-tight text-navy-900">
                    {result.total > 0 ? "No resources match those filters" : "Resources are on their way"}
                  </h2>
                  <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-muted">
                    {result.total > 0
                      ? "Try a different class or subject, or clear the filters to see everything available."
                      : content.emptyState}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href="/study-materials" variant="navy">
                      View all resources
                    </Button>
                    <Button href="/contact" variant="outline">
                      Ask the school office
                    </Button>
                  </div>
                </div>
                <div className="overflow-hidden rounded-[1.6rem]">
                  <SceneArt variant="library" className="aspect-[4/3] w-full" label="Illustration of the school library" />
                </div>
              </div>
            </Reveal>
          ) : (
            <>
              <p className="mt-6 text-[12px] font-bold text-muted">
                Showing {result.rows.length} of {result.total} resources
              </p>
              <RevealGroup className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {result.rows.map((material) => (
                  <RevealItem key={material.id} className="h-full">
                    <article className="group flex h-full flex-col rounded-[1.5rem] border border-line bg-white p-5 shadow-[0_16px_40px_-34px_rgba(18,50,92,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-blue/25 hover:shadow-soft">
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cream text-amber">
                          <Icon name="file" className="h-5 w-5" />
                        </span>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {material.class_level && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-extrabold text-blue">
                              {material.class_level}
                            </span>
                          )}
                          {material.subject && (
                            <span className="rounded-full bg-mint px-2.5 py-1 text-[10px] font-extrabold text-[#167a4a]">
                              {material.subject}
                            </span>
                          )}
                        </div>
                      </div>
                      <h2 className="mt-4 text-[17px] leading-snug text-navy-900">{material.title}</h2>
                      {material.description && (
                        <p className="mt-2 line-clamp-4 flex-1 text-[12.5px] leading-relaxed text-muted">{material.description}</p>
                      )}
                      {material.tags && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {material.tags.split(",").slice(0, 4).map((tag) => (
                            <span key={tag} className="rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-bold text-navy/55">
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                        <span className="text-[10.5px] font-bold text-muted">
                          {formatDate(material.published_at ?? material.created_at)}
                        </span>
                        {material.file_url ? (
                          <a
                            href={material.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-[11px] font-extrabold text-white transition hover:bg-navy-700"
                          >
                            <Icon name="download" className="h-3.5 w-3.5" />
                            Download
                          </a>
                        ) : (
                          <Link href="/contact" className="text-[11px] font-extrabold text-blue">
                            Ask for a copy →
                          </Link>
                        )}
                      </div>
                    </article>
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          )}

          <Pagination
            page={result.page}
            pages={result.pages}
            basePath="/study-materials"
            searchParams={{ q: sp.q, classLevel: sp.classLevel, subject: sp.subject }}
          />
        </div>
      </section>
    </>
  );
}
