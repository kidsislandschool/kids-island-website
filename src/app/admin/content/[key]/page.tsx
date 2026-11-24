import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getContentRecord, type ContentStatus } from "@/lib/content";
import { CONTENT_SCHEMAS, type ContentSchema } from "@/lib/content-schema";
import { pageForContentKey } from "@/lib/page-registry";
import { ContentEditor } from "@/components/admin/content-editor";
import { AdminPageHeader } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  return { title: CONTENT_SCHEMAS[key]?.label ?? "Content block" };
}

function defaultValue(schema: ContentSchema): unknown {
  if (schema.shape === "text") return "";
  const fields = schema.fields ?? [];
  if (fields.length === 1 && fields[0].name === "__items__") return [];
  return {};
}

function parseStored(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export default async function ContentBlockPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const schema = CONTENT_SCHEMAS[key];
  if (!schema) notFound();
  if (key === "settings.seo") redirect("/admin/seo");

  const record = getContentRecord(key);
  const status: ContentStatus =
    record?.status === "published" || record?.status === "draft" || record?.status === "needs_review"
      ? record.status
      : "draft";
  const value = record ? parseStored(record.value) ?? defaultValue(schema) : defaultValue(schema);
  const page = pageForContentKey(key);

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-bold text-muted">
        <Link href="/admin/content" className="transition hover:text-blue">
          Page content
        </Link>
        <Icon name="chevron-right" className="h-3 w-3" />
        <span>{schema.group}</span>
        <Icon name="chevron-right" className="h-3 w-3" />
        <span className="text-navy-900">{schema.label}</span>
      </nav>

      <AdminPageHeader eyebrow={schema.group} title={schema.label} description={schema.description}>
        {page && (
          <Link
            href={page.path}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
          >
            <Icon name="eye" className="h-3.5 w-3.5" />
            Preview {page.label}
          </Link>
        )}
        <Link
          href="/admin/content"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-3.5 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="chevron-left" className="h-3.5 w-3.5" />
          All content
        </Link>
      </AdminPageHeader>

      <ContentEditor
        schema={schema}
        initialValue={value}
        initialStatus={status}
        updatedAt={record?.updated_at}
      />
    </div>
  );
}
