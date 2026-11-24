import type { Metadata } from "next";
import Link from "next/link";
import { listContent } from "@/lib/content";
import { CONTENT_SCHEMAS } from "@/lib/content-schema";
import { COLLECTIONS } from "@/lib/collections";
import { getCollectionRows } from "@/lib/admin-data";
import { MANAGED_PAGES } from "@/lib/page-registry";
import { AdminCard, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Pages" };

const COLLECTION_LINKS: Record<string, string> = {
  notices: "/admin/notices",
  faculty: "/admin/faculty",
  materials: "/admin/materials",
  testimonials: "/admin/testimonials",
  faqs: "/admin/faqs",
  gallery_albums: "/admin/gallery?tab=albums",
  gallery_photos: "/admin/gallery?tab=photos",
};

export default async function AdminPagesPage() {
  const records = listContent();
  const recordMap = new Map(records.map((record) => [record.key, record]));
  const collectionCounts = new Map<string, number>();
  for (const key of Object.keys(COLLECTIONS)) {
    collectionCounts.set(key, getCollectionRows(key, { perPage: 1 }).total);
  }

  const groups = ["Main pages", "Portals"] as const;

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Website"
        title="Pages"
        description="The public site organised by page. Jump straight to the copy, collection or SEO entry that drives each screen."
      >
        <Link
          href="/admin/content"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="edit" className="h-3.5 w-3.5" />
          All content blocks
        </Link>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
          Open website
        </Link>
      </AdminPageHeader>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-white px-4 py-3">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Status key</span>
        {["published", "needs_review", "draft"].map((status) => (
          <StatusBadge key={status} status={status} />
        ))}
        <span className="ml-auto text-[10.5px] font-semibold text-muted">
          Only <strong className="text-navy">Published</strong> content appears on the public site.
        </span>
      </div>

      {groups.map((groupName) => {
        const pages = MANAGED_PAGES.filter((page) => page.group === groupName);
        if (pages.length === 0) return null;
        return (
          <section key={groupName} aria-labelledby={`pages-${groupName}`} className="flex flex-col gap-3">
            <h2 id={`pages-${groupName}`} className="font-display text-[17px] font-semibold text-navy-900">
              {groupName}
            </h2>
            <div className={cn("grid gap-4", groupName === "Main pages" ? "xl:grid-cols-2" : "md:grid-cols-2")}>
              {pages.map((page) => {
                const pageBlocks = page.contentKeys.map((key) => ({
                  key,
                  schema: CONTENT_SCHEMAS[key],
                  record: recordMap.get(key),
                }));
                const reviewCount = pageBlocks.filter(
                  (block) => !block.record || block.record.status !== "published"
                ).length;
                return (
                  <AdminCard key={page.path} className="flex h-full flex-col overflow-hidden">
                    <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-[16.5px] font-semibold text-navy-900">{page.label}</h3>
                          <code className="rounded-md bg-paper-2 px-1.5 py-0.5 text-[9.5px] font-bold text-muted">
                            {page.path}
                          </code>
                        </div>
                        <p className="mt-1 text-[11.5px] font-semibold leading-relaxed text-muted">{page.summary}</p>
                      </div>
                      <Link
                        href={page.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${page.label} on the public site`}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-white text-muted transition hover:bg-cream hover:text-navy"
                      >
                        <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 px-5 py-4">
                      {pageBlocks.length > 0 && (
                        <div>
                          <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-muted">
                            Page content
                          </p>
                          <ul className="mt-2 flex flex-col gap-1.5">
                            {pageBlocks.map((block) => (
                              <li key={block.key} className="flex items-center gap-2">
                                <Link
                                  href={`/admin/content/${encodeURIComponent(block.key)}`}
                                  className="min-w-0 flex-1 truncate text-[11.5px] font-bold text-navy-900 transition hover:text-blue"
                                >
                                  {block.schema?.label ?? block.key}
                                </Link>
                                <StatusBadge status={block.record?.status ?? "missing"} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {page.collections && page.collections.length > 0 && (
                        <div>
                          <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-muted">
                            School collections
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {page.collections.map((key) => {
                              const def = COLLECTIONS[key];
                              if (!def) return null;
                              return (
                                <Link
                                  key={key}
                                  href={COLLECTION_LINKS[key] ?? "/admin/content"}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-2/60 px-2.5 py-1 text-[10px] font-extrabold text-navy transition hover:border-blue/30 hover:bg-blue-100/60"
                                >
                                  {def.label}
                                  <span className="rounded-full bg-white px-1.5 text-[9px] text-muted">
                                    {collectionCounts.get(key) ?? 0}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {pageBlocks.length === 0 && (!page.collections || page.collections.length === 0) && (
                        <p className="rounded-xl bg-paper-2 px-3.5 py-3 text-[11px] font-semibold leading-relaxed text-muted">
                          This page is intentionally static in this phase. It has no editable content blocks.
                        </p>
                      )}

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3">
                        {page.seo ? (
                          <Link
                            href={`/admin/seo?page=${encodeURIComponent(page.path)}`}
                            className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold text-blue"
                          >
                            <Icon name="search" className="h-3 w-3" /> Edit SEO
                          </Link>
                        ) : (
                          <span />
                        )}
                        {reviewCount > 0 && pageBlocks.length > 0 ? (
                          <span className="text-[10px] font-bold text-[#9A5B00]">
                            {reviewCount} block{reviewCount === 1 ? "" : "s"} not published
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#167A4A]">Page content live</span>
                        )}
                      </div>
                    </div>
                  </AdminCard>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
