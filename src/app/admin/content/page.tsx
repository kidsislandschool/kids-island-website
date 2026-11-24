import type { Metadata } from "next";
import Link from "next/link";
import { listContent } from "@/lib/content";
import { CONTENT_GROUPS, CONTENT_SCHEMAS } from "@/lib/content-schema";
import { AdminCard, AdminPageHeader, adminInput, adminSelect, EmptyState, StatusBadge } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { cn, formatDateTime } from "@/lib/utils";
import { pageForContentKey } from "@/lib/page-registry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Page content" };

type Search = {
  q?: string;
  group?: string;
  status?: string;
};

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { q = "", group = "all", status = "all" } = await searchParams;
  const records = listContent();
  const recordMap = new Map(records.map((record) => [record.key, record]));
  const term = q.trim().toLowerCase();

  const blocks = Object.values(CONTENT_SCHEMAS)
    .map((schema) => {
      const record = recordMap.get(schema.key);
      return {
        schema,
        record,
        state: record?.status ?? ("missing" as const),
      };
    })
    .filter(({ schema, record, state }) => {
      if (group !== "all" && schema.group !== group) return false;
      if (status !== "all" && state !== status) return false;
      if (
        term &&
        !`${schema.label} ${schema.key} ${schema.group} ${schema.description ?? ""}`.toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const groupOrder =
        CONTENT_GROUPS.indexOf(a.schema.group) - CONTENT_GROUPS.indexOf(b.schema.group);
      if (groupOrder !== 0) return groupOrder;
      return a.schema.label.localeCompare(b.schema.label);
    });

  const counts = {
    total: Object.keys(CONTENT_SCHEMAS).length,
    published: 0,
    draft: 0,
    needs_review: 0,
    missing: 0,
  };
  for (const schema of Object.values(CONTENT_SCHEMAS)) {
    const state = recordMap.get(schema.key)?.status ?? "missing";
    counts[state] += 1;
  }

  const grouped = CONTENT_GROUPS.map((groupName) => ({
    name: groupName,
    blocks: blocks.filter((block) => block.schema.group === groupName),
  })).filter((entry) => entry.blocks.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Website"
        title="Page content"
        description="Every editable block on the public site. Draft and needs-review blocks stay hidden until published."
      >
        <Link
          href="/admin/pages"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="file" className="h-3.5 w-3.5" />
          View by page
        </Link>
      </AdminPageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Published" value={counts.published} tone="green" />
        <SummaryTile label="Needs review" value={counts.needs_review} tone="amber" />
        <SummaryTile label="Draft" value={counts.draft} tone="slate" />
        <SummaryTile label="Missing" value={counts.missing} tone="red" />
      </div>

      <form
        method="get"
        className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-3.5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] sm:flex-row sm:items-center"
      >
        <label className="relative flex-1">
          <span className="sr-only">Search content blocks</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={q}
            type="search"
            placeholder="Search content blocks…"
            className={cn(adminInput, "pl-9")}
          />
        </label>
        <label className="sm:w-48">
          <span className="sr-only">Filter by group</span>
          <select name="group" defaultValue={group} className={adminSelect}>
            <option value="all">All groups</option>
            {CONTENT_GROUPS.map((groupName) => (
              <option key={groupName} value={groupName}>
                {groupName}
              </option>
            ))}
          </select>
        </label>
        <label className="sm:w-44">
          <span className="sr-only">Filter by status</span>
          <select name="status" defaultValue={status} className={adminSelect}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="needs_review">Needs review</option>
            <option value="draft">Draft</option>
            <option value="missing">Not in database</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
          >
            Apply
          </button>
          {(q || group !== "all" || status !== "all") && (
            <Link
              href="/admin/content"
              className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-3 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      <p className="text-[11px] font-bold text-muted" aria-live="polite">
        Showing {blocks.length} of {counts.total} editable blocks
      </p>

      {grouped.length === 0 ? (
        <AdminCard>
          <EmptyState
            icon="search"
            title="No content blocks match"
            text="Try a different search term or clear the filters."
          >
            <Link
              href="/admin/content"
              className="inline-flex h-9 items-center rounded-lg bg-navy px-3.5 text-[11.5px] font-extrabold text-white"
            >
              Clear filters
            </Link>
          </EmptyState>
        </AdminCard>
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map((groupEntry) => (
            <AdminCard key={groupEntry.name}>
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                <h2 className="font-display text-[15.5px] font-semibold text-navy-900">{groupEntry.name}</h2>
                <span className="text-[10.5px] font-bold text-muted">{groupEntry.blocks.length} blocks</span>
              </div>
              <ul className="divide-y divide-line/70">
                {groupEntry.blocks.map(({ schema, record, state }) => {
                  const page = pageForContentKey(schema.key);
                  return (
                    <li key={schema.key} className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition hover:bg-paper-2/40">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/content/${encodeURIComponent(schema.key)}`}
                            className="text-[12.5px] font-extrabold text-navy-900 hover:text-blue"
                          >
                            {schema.label}
                          </Link>
                          {page && (
                            <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted">
                              {page.label}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[10.5px] font-semibold text-muted">
                          {schema.description ?? schema.key}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden text-[10px] font-semibold text-muted sm:block">
                          {record ? formatDateTime(record.updated_at) : "Not seeded"}
                        </span>
                        <StatusBadge status={state} />
                        <Link
                          href={`/admin/content/${encodeURIComponent(schema.key)}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-[10.5px] font-extrabold text-navy transition hover:border-blue/30 hover:bg-blue-100/50"
                        >
                          <Icon name="edit" className="h-3 w-3" />
                          Edit
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "slate" | "red";
}) {
  const tones = {
    green: "bg-[#EAF9F1] text-[#167A4A]",
    amber: "bg-[#FFF6E3] text-[#9A5B00]",
    slate: "bg-paper-2 text-muted",
    red: "bg-[#FFF1F4] text-[#A32D4B]",
  } as const;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3.5">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">{label}</p>
        <p className="mt-1 font-display text-[22px] font-semibold leading-none text-navy-900">{value}</p>
      </div>
      <span className={cn("h-9 w-1.5 rounded-full", tones[tone])} />
    </div>
  );
}
