import type { Metadata } from "next";
import Link from "next/link";
import { getContentRecord, type ContentStatus } from "@/lib/content";
import { CONTENT_SCHEMAS } from "@/lib/content-schema";
import { ContentEditor } from "@/components/admin/content-editor";
import { AdminCard, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Settings" };

const TABS = [
  {
    id: "details",
    label: "School details",
    key: "settings.site",
    icon: "building" as const,
    description: "Name, contact details, office hours and social links used across the site.",
  },
  {
    id: "navigation",
    label: "Navigation",
    key: "settings.nav",
    icon: "link" as const,
    description: "The main menu and the header call-to-action button.",
  },
  {
    id: "footer",
    label: "Footer",
    key: "settings.footer",
    icon: "file" as const,
    description: "Footer blurb, quick links, resource links, legal links and copyright.",
  },
  {
    id: "affiliation",
    label: "Affiliation",
    key: "settings.affiliation",
    icon: "shield" as const,
    description: "The affiliation claim shown on the public site once verified.",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isTab(value: string | undefined): value is TabId {
  return TABS.some((tab) => tab.id === value);
}

function parseStored(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tabId: TabId = isTab(rawTab) ? rawTab : "details";
  const tab = TABS.find((entry) => entry.id === tabId) ?? TABS[0];
  const schema = CONTENT_SCHEMAS[tab.key];
  const record = getContentRecord(tab.key);
  const status: ContentStatus =
    record?.status === "published" || record?.status === "draft" || record?.status === "needs_review"
      ? record.status
      : "draft";
  const value = record ? parseStored(record.value) : undefined;
  const initialValue =
    value ??
    (schema?.shape === "text"
      ? ""
      : schema?.fields?.length === 1 && schema.fields[0].name === "__items__"
        ? []
        : {});

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Website"
        title="Settings"
        description="School-wide details, navigation, footer and verified claims. Changes go live only when the block is published."
      >
        <Link
          href="/admin/seo"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="search" className="h-3.5 w-3.5" />
          Page SEO
        </Link>
        <Link
          href="/admin/account"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="user" className="h-3.5 w-3.5" />
          Account
        </Link>
      </AdminPageHeader>

      <div className="grid gap-5 lg:grid-cols-[212px_1fr]">
        <nav aria-label="Settings sections" className="flex flex-col gap-1 lg:sticky lg:top-[86px] lg:self-start">
          {TABS.map((entry) => {
            const active = entry.id === tabId;
            const entryRecord = getContentRecord(entry.key);
            return (
              <Link
                key={entry.id}
                href={`/admin/settings?tab=${entry.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[12px] font-extrabold transition",
                  active
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-white text-navy hover:border-blue/25 hover:bg-blue-100/40"
                )}
              >
                <Icon
                  name={entry.icon}
                  className={cn("h-4 w-4", active ? "text-yellow" : "text-muted")}
                />
                <span className="flex-1">{entry.label}</span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    entryRecord?.status === "published"
                      ? "bg-[#4FBF7B]"
                      : entryRecord?.status === "needs_review"
                        ? "bg-[#FFC53D]"
                        : "bg-white/30"
                  )}
                  title={entryRecord?.status ?? "Not saved"}
                />
              </Link>
            );
          })}

          <div className="mt-3 rounded-xl border border-line bg-white p-3.5">
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-muted">Related</p>
            <Link href="/admin/seo" className="mt-2 flex items-center gap-2 text-[11px] font-extrabold text-navy hover:text-blue">
              <Icon name="search" className="h-3.5 w-3.5 text-muted" /> Page SEO
            </Link>
            <Link href="/admin/pages" className="mt-2 flex items-center gap-2 text-[11px] font-extrabold text-navy hover:text-blue">
              <Icon name="file" className="h-3.5 w-3.5 text-muted" /> Pages overview
            </Link>
            <Link href="/admin/audit-log" className="mt-2 flex items-center gap-2 text-[11px] font-extrabold text-navy hover:text-blue">
              <Icon name="clock" className="h-3.5 w-3.5 text-muted" /> Audit log
            </Link>
          </div>
        </nav>

        <div className="min-w-0 flex-col">
          <AdminCard className="mb-4 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-[16.5px] font-semibold text-navy-900">{tab.label}</h2>
                <p className="mt-1 max-w-2xl text-[11.5px] font-semibold leading-relaxed text-muted">
                  {tab.description}
                </p>
              </div>
              <StatusBadge status={record?.status ?? "draft"} />
            </div>
          </AdminCard>

          {tabId === "affiliation" && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#F2DDB0] bg-[#FFF9EE] px-4 py-3.5">
              <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              <div>
                <p className="text-[11.5px] font-extrabold text-[#7A5200]">Conflicting information on the current site</p>
                <p className="mt-0.5 text-[11px] font-semibold leading-relaxed text-[#7A5200]/85">
                  The existing website claims UP Board affiliation, while the admissions content references CBSE age
                  guidelines. Confirm the correct position with the school. Until this block is published, no
                  affiliation claim is shown publicly.
                </p>
                <Link
                  href="/admin/content/admissions.eligibility"
                  className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-extrabold text-[#7A5200] underline"
                >
                  Review eligibility rules
                  <Icon name="arrow-right" className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {schema ? (
            <ContentEditor
              schema={schema}
              initialValue={initialValue}
              initialStatus={status}
              updatedAt={record?.updated_at}
            />
          ) : (
            <AdminCard className="p-6">
              <p className="text-sm font-semibold text-muted">This settings block is not defined.</p>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}
