import type { Metadata } from "next";
import Link from "next/link";
import { CollectionScreen } from "@/components/admin/collection-screen";
import { Icon } from "@/components/ui/icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "FAQs" };

export default function AdminFaqsPage() {
  return (
    <CollectionScreen
      collectionKey="faqs"
      eyebrow="School content"
      description="Questions and answers shown on the contact page and linked from admissions. Seeded FAQs are unverified and hidden until approved."
      actions={
        <Link
          href="/contact#faq"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream"
        >
          <Icon name="eye" className="h-3.5 w-3.5" />
          View contact FAQ
        </Link>
      }
      notice={
        <div className="flex items-start gap-2.5 rounded-xl border border-[#F2DDB0] bg-[#FFF9EE] px-4 py-3">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <p className="text-[11.5px] font-semibold leading-relaxed text-[#7A5200]">
            Confirm school timings, transport, class sizes and any other specific answers with the school office
            before publishing. Do not invent a student–teacher ratio or fees.
          </p>
        </div>
      }
      emptyMessage="No FAQs are published. The FAQ section is hidden on the contact page until the first answer is approved."
    />
  );
}
