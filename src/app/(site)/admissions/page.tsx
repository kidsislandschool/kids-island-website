import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { Icon, type IconName } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildPageMetadata("/admissions", {
    title: "Admissions",
    description: "Admission process, documents and enquiry form for Kids Island Senior Secondary School.",
  });
}

type AdmissionsPage = {
  heading: string;
  subheading: string;
  steps: { step: string; title: string; text: string }[];
  documents: string[];
  important: string[];
  classes: string[];
  contactPhone: string;
  contactEmail: string;
};

type Eligibility = { title: string; text: string }[];

const FALLBACK: AdmissionsPage = {
  heading: "Join our learning community",
  subheading: "Start your child's journey towards academic excellence and holistic development.",
  steps: [
    { step: "Step 1", title: "Submit Inquiry", text: "Fill out the admission inquiry form with student and parent details." },
    { step: "Step 2", title: "School Visit", text: "Schedule a visit to tour our campus and meet with our admission team." },
    { step: "Step 3", title: "Document Submission", text: "Submit required documents and complete the application process." },
    { step: "Step 4", title: "Confirmation", text: "Receive admission confirmation and complete enrollment formalities." },
  ],
  documents: [],
  important: [],
  classes: ["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"],
  contactPhone: "+91 9012655655",
  contactEmail: "contact@kidsaligarh.com",
};

const STEP_ICONS: IconName[] = ["file", "building", "edit", "check-circle"];

export default function AdmissionsPage() {
  const content = getContent<AdmissionsPage>("admissions.page", FALLBACK);
  const eligibility = getContent<Eligibility>("admissions.eligibility", []);

  return (
    <>
      <PageHero
        tone="cream"
        breadcrumb="Admissions"
        eyebrow="Admissions"
        title={<>Join our <span className="wave-underline">learning community</span></>}
        intro={content.subheading}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button href="#inquiry" className="group/btn">
            Start your enquiry
            <Icon name="arrow-down" className="h-4 w-4 transition-transform group-hover/btn:translate-y-0.5" />
          </Button>
          <Button href={`tel:${content.contactPhone.replace(/\s/g, "")}`} variant="outline">
            <Icon name="phone" className="h-4 w-4" />
            {content.contactPhone}
          </Button>
        </div>
      </PageHero>

      {/* process */}
      <section className="relative bg-paper py-20 sm:py-24" aria-labelledby="process-title">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Simple process"
              eyebrowTone="blue"
              title="Four easy steps to joining Kids Island"
              text="From your first enquiry to the first day of school — here is exactly what happens along the way."
            />
          </Reveal>

          <RevealGroup className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div aria-hidden className="absolute left-0 right-0 top-[3.2rem] hidden border-t-2 border-dashed border-navy/10 lg:block" />
            {content.steps.map((step, i) => (
              <RevealItem key={step.step} className="relative">
                <article className="group relative h-full rounded-[1.75rem] border border-line bg-white p-6 shadow-[0_16px_40px_-32px_rgba(18,50,92,0.4)] transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue transition-colors duration-300 group-hover:bg-blue group-hover:text-white">
                      <Icon name={STEP_ICONS[i] ?? "check"} className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[19px] text-navy-900">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{step.text}</p>
                  <span className="mt-5 block font-display text-5xl font-semibold leading-none text-navy/[0.06]">
                    0{i + 1}
                  </span>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* inquiry + documents */}
      <section id="inquiry" className="relative overflow-hidden bg-cream py-20 sm:py-24 scroll-mt-24">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="dot-grid absolute inset-0 text-navy/[0.035]" />
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-yellow/15 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <Reveal direction="left">
              <div className="rounded-[2rem] border border-white bg-white p-6 shadow-[0_30px_70px_-45px_rgba(18,50,92,0.5)] sm:p-9">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow text-navy-900">
                    <Icon name="file" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-[clamp(1.5rem,2.6vw,1.9rem)] leading-tight text-navy-900">Admission enquiry</h2>
                    <p className="text-[12.5px] font-semibold text-muted">Share a few details and our team will call you.</p>
                  </div>
                </div>
                <div className="mt-7">
                  <InquiryForm type="admission" classes={content.classes} />
                </div>
              </div>
            </Reveal>

            <div className="flex flex-col gap-4">
              <Reveal direction="right">
                <div className="rounded-[1.75rem] border border-line bg-white p-6 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-[#167a4a]">
                      <Icon name="file" className="h-5 w-5" />
                    </span>
                    <h2 className="text-lg text-navy-900">Documents checklist</h2>
                  </div>
                  <p className="mt-2 text-[12px] font-semibold text-muted">
                    Please bring originals for verification. Photocopies will be retained.
                  </p>
                  <ul className="mt-4 space-y-2">
                    {content.documents.map((doc) => (
                      <li key={doc} className="flex items-start gap-2.5 text-[12.5px] font-bold leading-snug text-navy/75">
                        <Icon name="check-circle" className="mt-0.5 h-4 w-4 shrink-0 text-[#4FBF7B]" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {content.important.length > 0 && (
                <Reveal direction="right" delay={0.06}>
                  <div className="rounded-[1.75rem] bg-navy p-6 text-white sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-yellow">
                        <Icon name="info" className="h-5 w-5" />
                      </span>
                      <h2 className="text-lg text-white">Good to know</h2>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {content.important.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-[12.5px] font-semibold leading-relaxed text-white/70">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 border-t border-white/10 pt-4 text-[12px] font-semibold text-white/60">
                      <p className="flex items-center gap-2">
                        <Icon name="phone" className="h-4 w-4 text-yellow" />
                        {content.contactPhone}
                      </p>
                      <p className="mt-2 flex items-center gap-2">
                        <Icon name="mail" className="h-4 w-4 text-yellow" />
                        {content.contactEmail}
                      </p>
                    </div>
                  </div>
                </Reveal>
              )}

              {eligibility.length > 0 && (
                <Reveal direction="right" delay={0.1}>
                  <div className="rounded-[1.75rem] border border-line bg-white p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue">
                        <Icon name="user-group" className="h-5 w-5" />
                      </span>
                      <h2 className="text-lg text-navy-900">Eligibility</h2>
                    </div>
                    <dl className="mt-4 space-y-3">
                      {eligibility.map((item) => (
                        <div key={item.title}>
                          <dt className="text-[12.5px] font-extrabold text-navy">{item.title}</dt>
                          <dd className="text-[12px] font-semibold leading-relaxed text-muted">{item.text}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </Reveal>
              )}
            </div>
          </div>

          <Reveal className="mt-10">
            <div className="flex flex-col items-center justify-between gap-4 rounded-[1.75rem] border border-line bg-white/70 px-6 py-5 backdrop-blur sm:flex-row">
              <div className="flex items-center gap-3">
                <Badge tone="blue" icon={<Icon name="info" className="h-3.5 w-3.5" />}>
                  Before you apply
                </Badge>
                <p className="text-[12.5px] font-semibold text-muted">
                  Admissions are subject to seat availability in the respective class.
                </p>
              </div>
              <Link href="/contact#faq" className="text-[12.5px] font-extrabold text-blue">
                Read admission FAQs →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
