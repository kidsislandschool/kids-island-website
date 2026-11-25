"use client";

import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Pagination } from "@/components/ui/pagination";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

interface Material {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  class_level: string;
  subject: string;
  file_type: string | null;
  file_size: number | null;
  published_at: string | null;
  created_at: string;
}

interface MaterialListProps {
  materials: Material[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
}

export function MaterialList({
  materials,
  isLoading,
  page,
  totalPages,
  total,
  onRefresh,
  onPageChange,
}: MaterialListProps) {
  const rangeStart = total > 0 ? (page - 1) * 9 + 1 : 0;
  const rangeEnd = Math.min(page * 9, total);

  return (
    <>
      {/* Header + refresh */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy-900">Study Materials</h2>
          <p className="mt-1 text-sm text-muted">
            {total > 0 ? `Showing ${rangeStart}–${rangeEnd} of ${total} resources` : "No resources found"}
          </p>
        </div>
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Icon name="refresh-cw" className={cn("h-4 w-4", isLoading && "animate-spin")} />
          <span>{isLoading ? "Refreshing…" : "Refresh"}</span>
        </Button>
      </div>

      {materials.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-5 rounded-[2rem] border-2 border-dashed border-line bg-white/60 px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-3xl bg-cream text-amber">
            <Icon name="book" className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-xl text-navy-900">
              {total > 0 ? "No resources match those filters" : "Resources are on their way"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
              {total > 0
                ? "Try a different class or subject, or clear the filters to see everything available."
                : "No study materials have been published yet."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/contact" variant="primary" size="sm">
                Contact the school
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <RevealGroup className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <RevealItem key={material.id} className="h-full">
                <Link
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-[1.5rem] border border-line bg-white p-5 shadow-[0_16px_40px_-32px_rgba(18,50,92,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-blue/30 hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-blue-100 text-blue">
                      <Icon name="file-text" className="h-6 w-6" />
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-extrabold text-blue">
                        {material.class_level}
                      </span>
                      <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-extrabold text-[#8a5a00]">
                        {material.subject}
                      </span>
                    </div>
                  </div>
                  <h2 className="mt-4 text-[17px] leading-snug text-navy-900 transition-colors group-hover:text-blue">
                    {material.title}
                  </h2>
                  {material.description && (
                    <p className="mt-2 line-clamp-2 flex-1 text-[12.5px] leading-relaxed text-muted">{material.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <span className="text-[10.5px] font-bold text-muted">
                      {formatDate(material.published_at ?? material.created_at)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue">
                      Download
                      <Icon name="download" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>

          <Pagination
            page={page}
            pages={totalPages}
            basePath="/study-materials"
            searchParams={{ q: "", classLevel: "", subject: "" }}
            onPageChange={onPageChange}
          />
        </>
      )}
    </>
  );
}
