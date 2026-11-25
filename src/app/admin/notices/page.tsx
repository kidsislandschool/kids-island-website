import type { Metadata } from "next";
import Link from "next/link";
import { CollectionScreen } from "@/components/admin/collection-screen";
import { Icon } from "@/components/ui/icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Notices" };

export default function AdminNoticesPage() {
  return (
    <CollectionScreen
      collectionKey="notices"
      eyebrow="School content"
      description="Publish notices, events, holidays, exam updates and results. Pinned notices stay at the top of the public list."
      actions={
        <Link
          href="/notices"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="eye" className="h-3.5 w-3.5" />
          View public page
        </Link>
      }
      notice={
        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-green-200/40 px-4 py-3">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
          <p className="text-[11.5px] font-semibold leading-relaxed text-navy/75">
            New notices publish immediately by default. Keep time-sensitive notices accurate, and set an event or
            effective date so families can see when it applies. Draft notices remain hidden.
          </p>
        </div>
      }
      emptyMessage="No notices yet. The homepage notice strip and the public notices page stay hidden until the first notice is published."
    />
  );
}
