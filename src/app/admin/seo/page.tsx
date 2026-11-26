import type { Metadata } from "next";
import Link from "next/link";
import { getContentRecord, type ContentStatus } from "@/lib/content";
import { SEO_PAGES } from "@/lib/page-registry";
import { SeoEditor } from "@/components/admin/seo-editor";
import { AdminPageHeader } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "SEO" };

function parseStored(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function AdminSeoPageContent({
  record,
  status,
  value,
  initialPage,
}: {
  record: any;
  status: ContentStatus;
  value: unknown;
  initialPage: string | undefined;
}) {
  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        eyebrow="Website"
        title="SEO & sharing"
        description="Control the title, description, canonical path and social image for every public page."
      >
        <Link
          href="/admin/settings"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="settings" className="h-3.5 w-3.5" />
          Settings
        </Link>
        <Link
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="link" className="h-3.5 w-3.5" />
          Sitemap
        </Link>
      </AdminPageHeader>

      <div className="flex items-start gap-2.5 rounded-xl border border-line bg-green-200/40 px-4 py-3">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
        <p className="text-[11.5px] font-semibold leading-relaxed text-navy/75">
          Page titles and descriptions are used in search results and social previews. When an override is set to
          draft or needs review, the public site falls back to its built-in metadata. This editor covers{" "}
          {SEO_PAGES.length} pages.
        </p>
      </div>

      <SeoEditor
        initialValue={value}
        initialStatus={status}
        updatedAt={record?.updated_at}
        initialPage={initialPage}
      />
    </div>
  );
}

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: initialPage } = await searchParams;
  const record = await getContentRecord("settings.seo");
  const status: ContentStatus =
    record?.status === "published" || record?.status === "draft" || record?.status === "needs_review"
      ? record.status
      : "draft";
  const value = parseStored(record?.value) ?? {};

  return <AdminSeoPageContent record={record} status={status} value={value} initialPage={initialPage} />;
}