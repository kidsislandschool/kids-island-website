import type { Metadata } from "next";
import Link from "next/link";
import { CollectionScreen } from "@/components/admin/collection-screen";
import { Icon } from "@/components/ui/icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Testimonials" };

export default function AdminTestimonialsPage() {
  return (
    <CollectionScreen
      collectionKey="testimonials"
      eyebrow="School content"
      description="Quotes from parents and students. The three extracted quotes are seeded as “Needs review” and are not public until approved."
      actions={
        <>
          <Link
            href="/admin/faqs"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
          >
            <Icon name="info" className="h-3.5 w-3.5" />
            Manage FAQs
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
          >
            <Icon name="eye" className="h-3.5 w-3.5" />
            View homepage
          </Link>
        </>
      }
      notice={
        <div className="flex items-start gap-2.5 rounded-xl border border-[#F2DDB0] bg-[#FFF9EE] px-4 py-3">
          <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <div>
            <p className="text-[11.5px] font-extrabold text-[#7A5200]">Do not publish testimonials until permission is confirmed</p>
            <p className="mt-0.5 text-[11px] font-semibold leading-relaxed text-[#7A5200]/85">
              The seeded quotes came from the old website and have not been authenticated. Contact each family,
              confirm they said it, and get permission before switching the status to Published.
            </p>
          </div>
        </div>
      }
      emptyMessage="No testimonials are published. The testimonials section stays hidden on the homepage until an approved quote is live."
    />
  );
}
