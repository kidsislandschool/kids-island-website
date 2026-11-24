import type { Metadata } from "next";
import { getAffiliation, getContent } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { getLatestNotices, getPublishedTestimonials } from "@/lib/data";
import { Hero, type HeroContent } from "@/components/motion/hero";
import { PinnedSequence } from "@/components/motion/pinned-sequence";
import { TrustRow, type Highlight } from "@/components/sections/trust-row";
import { ProgramsSection, type Program } from "@/components/sections/programs";
import { FacilitiesSection, type Facility } from "@/components/sections/facilities";
import { AdmissionsCta, type CtaContent } from "@/components/sections/admissions-cta";
import { PrincipalMessage, type PrincipalContent } from "@/components/sections/principal";
import { StatsBand, type Stat } from "@/components/sections/stats";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { NoticesPreview } from "@/components/sections/notices-preview";
import type { SequenceItem } from "@/components/motion/pinned-sequence";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildPageMetadata("/", {
    title: "Kids Island Senior Secondary School, Aligarh",
    description:
      "A joyful, caring school in Aligarh for nursery to class 12 — quality education, experienced faculty, modern facilities and a campus where every child belongs.",
  });
}

const FALLBACK_HERO: HeroContent = {
  eyebrow: "Kids Island Senior Secondary School · Aligarh",
  headline: "Shaping bright futures through quality education",
  intro:
    "A joyful, safe and stimulating campus where children from nursery to class 12 grow into confident, curious and capable young learners.",
  primaryCta: { label: "Apply for Admission", href: "/admissions#inquiry" },
  secondaryCta: { label: "Explore Academics", href: "/academics" },
  badges: ["Nursery to Class 12", "Maths & Biology streams", "Caring, safe campus"],
  slides: [
    { id: "s1", label: "Curious young learners", variant: "classroom" },
    { id: "s2", label: "Hands-on discovery", variant: "science" },
    { id: "s3", label: "Reading & imagination", variant: "library" },
    { id: "s4", label: "Play, sport & teamwork", variant: "play" },
  ],
};

const FALLBACK_CTA: CtaContent = {
  title: "Ready to join our community?",
  text: "Start your child's journey towards academic excellence and personal growth at Kids Island Senior Secondary School.",
  primary: { label: "Apply Now", href: "/admissions#inquiry" },
  secondary: { label: "Book a Campus Visit", href: "/contact#visit" },
};

const FALLBACK_PRINCIPAL: PrincipalContent = {
  heading: "A message from the school",
  body:
    "Every child who walks through our gates carries a spark of potential. Our promise is to nurture that spark with warmth, discipline and joyful learning.",
  authorName: "— To be confirmed by the school",
  authorRole: "Principal, Kids Island Senior Secondary School",
  photo: null,
};

export default function HomePage() {
  const hero = getContent<HeroContent>("home.hero", FALLBACK_HERO);
  const affiliation = getAffiliation();
  const highlights = getContent<Highlight[]>("home.highlights", []);
  const programs = getContent<Program[]>("home.programs", []);
  const facilities = getContent<Facility[]>("home.facilities", []);
  const cta = getContent<CtaContent>("home.cta", FALLBACK_CTA);
  const principal = getContent<PrincipalContent>("home.principal", FALLBACK_PRINCIPAL);
  const why = getContent<SequenceItem[]>("home.why", []);
  const stats = getContent<Stat[]>("home.stats", []);
  const testimonials = getPublishedTestimonials().map((t) => ({
    id: t.id,
    quote: t.quote,
    author_name: t.author_name,
    author_role: t.author_role,
  }));
  const notices = getLatestNotices(3);

  return (
    <>
      <Hero content={hero} affiliation={affiliation || undefined} />
      <TrustRow items={highlights} />
      <ProgramsSection programs={programs} />
      <FacilitiesSection facilities={facilities} />
      <AdmissionsCta content={cta} />
      <PrincipalMessage content={principal} />
      {why.length > 0 && (
        <PinnedSequence
          id="why"
          eyebrow="Why families choose us"
          heading={
            <>
              Small campus. Big <span className="text-yellow">possibilities.</span>
            </>
          }
          intro="Four promises that shape the everyday experience of every child at Kids Island."
          items={why}
        />
      )}
      <StatsBand stats={stats} />
      <TestimonialsSection testimonials={testimonials} />
      <NoticesPreview notices={notices} />
    </>
  );
}
