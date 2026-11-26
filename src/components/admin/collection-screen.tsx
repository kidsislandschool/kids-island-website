import { notFound } from "next/navigation";
import { getCollectionDef, getCollectionRows, getCollectionStatusCounts } from "@/lib/admin-data";
import { AdminPageHeader } from "./ui";
import { CollectionManager } from "./collection-manager";

/**
 * Shared server shell for the generic collection screens (faculty, notices,
 * materials, testimonials, FAQs). Keeps status summaries and headers
 * consistent across the admin.
 */
export async function CollectionScreen({
  collectionKey,
  eyebrow,
  description,
  actions,
  notice,
  optionOverrides,
  emptyMessage,
}: {
  collectionKey: string;
  eyebrow: string;
  description: string;
  actions?: React.ReactNode;
  notice?: React.ReactNode;
  optionOverrides?: Record<string, { value: string; label: string }[]>;
  emptyMessage?: string;
}) {
  const def = getCollectionDef(collectionKey);
  if (!def) notFound();

  const initial = await getCollectionRows(collectionKey, { perPage: 50 });
  const counts = await getCollectionStatusCounts(collectionKey);

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader eyebrow={eyebrow} title={def.label} description={description}>
        {actions}
      </AdminPageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Published", value: counts.published, tone: "bg-[#EAF9F1] text-[#167A4A]" },
          { label: "Needs review", value: counts.needs_review, tone: "bg-[#FFF6E3] text-[#9A5B00]" },
          { label: "Draft", value: counts.draft, tone: "bg-paper-2 text-muted" },
          { label: "Total", value: counts.total, tone: "bg-blue-100 text-blue" },
        ].map((tile) => (
          <div key={tile.label} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3.5">
            <div>
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">{tile.label}</p>
              <p className="mt-1 font-display text-[22px] font-semibold leading-none text-navy-900">{tile.value}</p>
            </div>
            <span className={`h-9 w-1.5 rounded-full ${tile.tone}`} />
          </div>
        ))}
      </div>

      {notice}

      {counts.total === 0 && emptyMessage && (
        <div className="rounded-xl border border-line bg-blue-100/40 px-4 py-3 text-[11.5px] font-semibold leading-relaxed text-navy/70">
          {emptyMessage}
        </div>
      )}

      <CollectionManager
        collectionKey={collectionKey}
        def={def}
        initialRows={initial.rows}
        initialTotal={initial.total}
        optionOverrides={optionOverrides}
      />
    </div>
  );
}
