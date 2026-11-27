import type { Metadata } from "next";
import Link from "next/link";
import { CollectionScreen } from "@/components/admin/collection-screen";
import { Icon } from "@/components/ui/icon";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Study materials" };

export default async function AdminMaterialsPage() {
  // Fetch staff and admin users for the "published by" dropdown
  const [{ data: staff }, { data: admins }] = await Promise.all([
    supabaseAdmin.from('staff').select('id, name').eq('status', 'approved'),
    supabaseAdmin.from('users').select('id, name').eq('role', 'master_admin'),
  ]);

  const creatorOptions = [
    ...(staff?.map(s => ({ value: String(s.id), label: `${s.name} (Staff)` })) || []),
    ...(admins?.map(a => ({ value: String(a.id), label: `${a.name} (Admin)` })) || []),
  ];

  return (
    <CollectionScreen
      collectionKey="materials"
      eyebrow="School content"
      description="Publish notes, assignments and resources for students. Upload a PDF or link to an existing document, then choose the class and subject."
      actions={
        <Link
          href="/study-materials"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="eye" className="h-3.5 w-3.5" />
          View public page
        </Link>
      }
      optionOverrides={{
        created_by: creatorOptions,
      }}
      notice={
        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-green-200/40 px-4 py-3">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
          <p className="text-[11.5px] font-semibold leading-relaxed text-navy/75">
            Uploads accept images and PDFs up to 12 MB. PDFs are checked before they are stored; images are
            re-encoded to WebP. Only publish material the school owns or has permission to distribute.
          </p>
        </div>
      }
      emptyMessage="No study material has been published yet. Students see a friendly empty state until the first resource is live."
    />
  );
}
