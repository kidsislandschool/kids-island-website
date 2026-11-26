import type { Metadata } from "next";
import Link from "next/link";
import {
  albumChoices,
  getCollectionDef,
  getCollectionRows,
  getCollectionStatusCounts,
} from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui";
import { CollectionManager } from "@/components/admin/collection-manager";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tab = rawTab === "photos" ? "photos" : "albums";
  const collectionKey = tab === "photos" ? "gallery_photos" : "gallery_albums";
  const def = getCollectionDef(collectionKey);
  const [initial, counts, albums, albumCounts, photoCounts] = await Promise.all([
    getCollectionRows(collectionKey, { perPage: 50 }),
    getCollectionStatusCounts(collectionKey),
    albumChoices(),
    getCollectionStatusCounts("gallery_albums"),
    getCollectionStatusCounts("gallery_photos"),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="School content"
        title="Gallery"
        description="Organise photos into albums, write meaningful alt text and choose which images are featured."
      >
        <Link
          href="/gallery"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="eye" className="h-3.5 w-3.5" />
          View public gallery
        </Link>
      </AdminPageHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Gallery sections" className="inline-flex rounded-xl border border-line bg-white p-1">
          {[
            { id: "albums", label: "Albums", count: albumCounts.total },
            { id: "photos", label: "Photos", count: photoCounts.total },
          ].map((entry) => (
            <Link
              key={entry.id}
              href={`/admin/gallery?tab=${entry.id}`}
              role="tab"
              aria-selected={tab === entry.id}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[11.5px] font-extrabold transition",
                tab === entry.id ? "bg-navy text-white" : "text-navy hover:bg-paper-2"
              )}
            >
              {entry.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px]",
                  tab === entry.id ? "bg-white/15 text-white" : "bg-paper-2 text-muted"
                )}
              >
                {entry.count}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-muted">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#4FBF7B]" /> {counts.published} published</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#FFC53D]" /> {counts.needs_review} to review</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#C9D4E5]" /> {counts.draft} draft</span>
        </div>
      </div>

      {tab === "photos" && albums.length === 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-[#F2DDB0] bg-[#FFF9EE] px-4 py-3 sm:flex-row sm:items-center">
          <Icon name="alert-triangle" className="h-4 w-4 shrink-0 text-amber" />
          <p className="flex-1 text-[11.5px] font-semibold leading-relaxed text-[#7A5200]">
            You need at least one album before adding photos.
          </p>
          <Link
            href="/admin/gallery?tab=albums"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#8a5a00] px-3 text-[10.5px] font-extrabold text-white"
          >
            <Icon name="plus" className="h-3 w-3" /> Create an album
          </Link>
        </div>
      )}

      {tab === "photos" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-green-200/40 px-4 py-3">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
          <p className="text-[11.5px] font-semibold leading-relaxed text-navy/75">
            Alt text is required for every photo and should describe what is happening, not repeat the caption.
            Images are resized to a maximum of 1800px and stored as WebP. Only upload photos the school has
            permission to publish, especially images of children.
          </p>
        </div>
      )}

      {def && (
        <CollectionManager
          key={collectionKey}
          collectionKey={collectionKey}
          def={def}
          initialRows={initial.rows}
          initialTotal={initial.total}
          optionOverrides={
            tab === "photos"
              ? {
                  album_id: albums.map((album) => ({ value: String(album.id), label: album.title })),
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
