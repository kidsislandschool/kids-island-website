import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReviewForm } from "@/components/forms/review-form";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return await buildPageMetadata("/review", {
    title: "Share Your Experience",
    description: "Submit a testimonial about your experience at Kids Island Senior Secondary School, Aligarh.",
  });
}

export default function ReviewPage() {
  return (
    <>
      <PageHero
        tone="cream"
        breadcrumb="Review"
        eyebrow="Share your experience"
        title={<>We'd love to hear <span className="wave-underline">from you</span></>}
        intro="Your feedback helps other families discover what makes Kids Island special. All submissions are reviewed by the school office before publication."
      >
        <Link href="/" className="inline-flex items-center gap-1.5 text-blue hover:underline text-[11.5px] font-extrabold">
          <Icon name="arrow-left" className="h-4 w-4" /> Back to home
        </Link>
      </PageHero>

      <section className="bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Parent review"
              title="Share your story"
              text="Tell us about your child's experience — from academics and activities to the teachers who made a difference. Your words help prospective families make informed decisions."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <ReviewForm />
          </Reveal>

          <Reveal delay={0.2} className="mt-8">
            <div className="rounded-2xl border border-white bg-white p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-200 text-[#167a4a] shrink-0">
                  <Icon name="shield" className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[16px] font-extrabold text-navy-900">Your privacy matters</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                    All testimonials are reviewed by the school office before publication. We will never publish your
                    contact details. You can request edits or removal at any time by contacting the school office.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}