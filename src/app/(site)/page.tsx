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

      {/* managing director message */}
      <section className="relative overflow-hidden bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Leadership"
              title={
                <>
                  A message from the <span className="wave-underline">Managing Director</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.1} direction="left">
            <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-white shadow-lift">
                <CmsImage
                  src="https://oipxarmkmzryrluflcfh.supabase.co/storage/v1/object/public/media/founder-1795765610384.jpeg"
                  alt="Managing Director, Kids Island Senior Secondary School"
                  variant="school"
                  className="aspect-[3/4] w-full"
                />
              </div>
              <div className="space-y-5 text-[15px] leading-relaxed text-muted">
                <p className="font-display text-[22px] font-semibold text-navy-900">
                  A Message from the Managing Director
                </p>
                <p>
                  It gives me immense pleasure to welcome you to Kids Island Senior Secondary School, an institution
                  built on the foundation of knowledge, values, discipline and excellence.
                </p>
                <p>
                  As we proudly celebrate 25 glorious years of our journey, we look back with gratitude and forward
                  with renewed commitment.
                </p>
                <p>
                  Our vision has always been to nurture young minds, inspire curiosity and shape confident,
                  responsible and compassionate individuals.
                </p>
                <p>
                  We believe that education is not merely about academic achievements but also about building
                  character and preparing children for life.
                </p>
                <p>
                  At Kids Island, every child is valued, encouraged and given the opportunity to discover their
                  true potential.
                </p>
                <p>
                  Our dedicated team of educators strives to create a positive, safe and inspiring learning
                  environment.
                </p>
                <p>
                  The trust and support of our parents have been the greatest strength behind our success.
                </p>
                <p>
                  Together, let us continue this journey of learning, growth and excellence.
                </p>
                <p className="font-semibold text-navy-900 pt-2 border-t border-line">
                  With warm regards,<br />
                  Managing Director<br />
                  Kids Island Senior Secondary School
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <TestimonialsSection testimonials={testimonials} />
      <NoticesPreview notices={notices} />
    </>
  );
}
