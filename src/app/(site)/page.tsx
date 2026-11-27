import type { Metadata } from "next";
import { getAffiliation, getContent } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedAlbums, getPublishedTestimonials, getLatestNotices } from "@/lib/data";
import { Hero, type HeroContent } from "@/components/motion/hero";
import { PinnedSequence } from "@/components/motion/pinned-sequence";
import { TrustRow, type Highlight } from "@/components/sections/trust-row";
import { ProgramsSection, type Program } from "@/components/sections/programs";
import { GalleryAlbumsPreview } from "@/components/sections/gallery-albums-preview";
import { AdmissionsCta, type CtaContent } from "@/components/sections/admissions-cta";
import { PrincipalMessage, type PrincipalContent } from "@/components/sections/principal";
import { StatsBand, type Stat } from "@/components/sections/stats";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { NoticesPreview } from "@/components/sections/notices-preview";
import type { SequenceItem } from "@/components/motion/pinned-sequence";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CmsImage } from "@/components/ui/cms-image";
import { Icon } from "@/components/ui/icon";
import { Cloud } from "@/components/ui/clouds";

// Revalidate every 60 seconds - allows caching while keeping content fresh
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return await buildPageMetadata("/", {
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

export default async function HomePage() {
  // Parallelize all data fetching for better performance
  const [
    hero,
    affiliation,
    highlights,
    programs,
    cta,
    principal,
    why,
    stats,
    testimonialsData,
    notices,
  ] = await Promise.all([
    getContent<HeroContent>("home.hero", FALLBACK_HERO),
    getAffiliation(),
    getContent<Highlight[]>("home.highlights", []),
    getContent<Program[]>("home.programs", []),
    getContent<CtaContent>("home.cta", FALLBACK_CTA),
    getContent<PrincipalContent>("home.principal", FALLBACK_PRINCIPAL),
    getContent<SequenceItem[]>("home.why", []),
    getContent<Stat[]>("home.stats", []),
    getPublishedTestimonials(),
    getLatestNotices(3),
  ]);

  const testimonials = testimonialsData.map((t) => ({
    id: t.id,
    quote: t.quote,
    author_name: t.author_name,
    author_role: t.author_role,
  }));

  return (
    <>
      <Hero content={hero} affiliation={affiliation || undefined} />
      <TrustRow items={highlights} />
      <ProgramsSection programs={programs} />
      <PrincipalMessage content={principal} />
      <GalleryAlbumsPreview />
      <AdmissionsCta content={cta} />
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
