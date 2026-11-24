import type { Metadata } from "next";
import Link from "next/link";
import { CollectionScreen } from "@/components/admin/collection-screen";
import { Icon } from "@/components/ui/icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Faculty" };

export default function AdminFacultyPage() {
  return (
    <CollectionScreen
      collectionKey="faculty"
      eyebrow="School content"
      description="Create, publish and order faculty profiles. Only real staff approved by the school should be added."
      actions={
        <Link
          href="/faculty"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="eye" className="h-3.5 w-3.5" />
          View public page
        </Link>
      }
      notice={
        <div className="flex items-start gap-2.5 rounded-xl border border-[#F2DDB0] bg-[#FFF9EE] px-4 py-3">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <p className="text-[11.5px] font-semibold leading-relaxed text-[#7A5200]">
            No faculty names or photographs were supplied in the brief, so the public page starts with an empty
            state. Add profiles only after the school confirms each person&apos;s details and photo permission.
          </p>
        </div>
      }
      emptyMessage="No profiles yet — the public faculty page will show its empty state until the first profile is published."
    />
  );
}
