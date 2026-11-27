import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CmsImage } from "@/components/ui/cms-image";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { StatsBand, type Stat } from "@/components/sections/stats";
import { CloudDivider } from "@/components/ui/clouds";

// Revalidate every 60 seconds
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return await buildPageMetadata("/about", {
    title: "About Us",
    description: "Learn about Kids Island Senior Secondary School, Aligarh.",
  });
}

type AboutPage = {
  heading: string;
  introHeading: string;
  story: string[];
  mission: string;
  vision: string;
  values: { title: string; text: string }[];
  whyChoose: { title: string; text: string }[];
  facilities: string[];
  storyPhoto?: string | null;
  storyInset?: string | null;
};

const FALLBACK: AboutPage = {
  heading: "About Kids Island Senior Secondary School",
  introHeading: "Building futures through quality education for 25 years",
  story: [
    "Kids Island Senior Secondary School was established with a vision to provide quality education to students in Aligarh and surrounding areas.",
  ],
  mission:
    "To provide a nurturing and stimulating learning environment that encourages academic excellence, critical thinking, and character development.",
  vision:
    "To be recognized as a leading educational institution that shapes future leaders through innovative teaching methods and holistic development.",
  values: [],
  whyChoose: [],
  facilities: [],
  storyPhoto: null,
  storyInset: null,
};

function highlight(text: string, phrase: string) {
  const at = text.toLowerCase().indexOf(phrase.toLowerCase());
  if (at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="wave-underline">{text.slice(at, at + phrase.length)}</span>
      {text.slice(at + phrase.length)}
    </>
  );
}

export default async function AboutPage() {
  const [content, stats] = await Promise.all([
    getContent<AboutPage>("about.page", FALLBACK),
    getContent<Stat[]>("about.stats", []),
  ]);

  return (
    <>
      <PageHero
        tone="blue"
        breadcrumb="About Us"
        eyebrow="About Kids Island"
        title={<>Building futures through <span className="wave-underline">quality education</span></>}
        intro={content.heading}
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/admissions#inquiry" className="group/btn">
            Join our community
            <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
          <Button href="/contact" variant="outline">
            Visit the campus
          </Button>
        </div>
      </PageHero>

      {/* story */}
      <section className="relative overflow-hidden bg-paper py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr]">
          <Reveal direction="left" className="relative mx-auto w-full max-w-lg lg:mx-0">
            <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-white shadow-lift">
              <CmsImage src={content.storyPhoto} alt="Kids Island school building" variant="school" className="aspect-[4/3.2] w-full" />
            </div>
            <div className="absolute -bottom-8 -right-2 w-40 overflow-hidden rounded-[1.4rem] border-[5px] border-white shadow-lift sm:-right-6 sm:w-48">
              <CmsImage src={content.storyInset} alt="A classroom at Kids Island" variant="classroom" className="aspect-square w-full" />
            </div>
            <div className="absolute -left-3 -top-4 rounded-2xl bg-yellow px-4 py-3 shadow-[0_16px_32px_-16px_rgba(255,159,28,0.8)]">
              <p className="font-display text-[15px] font-semibold leading-none text-navy-900">Nursery to Class 12</p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-navy/60">One campus, every stage</p>
            </div>
            <div aria-hidden className="absolute -bottom-3 -left-3 -z-10 h-full w-full rounded-[2rem] bg-mint" />
          </Reveal>

          <div>
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="Our story"
                title={highlight(content.introHeading, "quality education")}
                className="[&_h2]:max-w-xl"
              />
            </Reveal>
            <div className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-muted">
              {content.story.map((paragraph, i) => (
                <Reveal key={i} delay={0.05 + i * 0.04}>
                  <p>{paragraph}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-200 text-blue">
                  <Icon name="building" className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="text-[13px] font-extrabold text-navy-900">Heart of Aligarh</p>
                  <p className="text-[11px] font-bold text-muted">Centrally accessible</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blush text-[#b23a6b]">
                  <Icon name="graduation" className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="text-[13px] font-extrabold text-navy-900">Nursery to Class 12</p>
                  <p className="text-[11px] font-bold text-muted">Maths & Biology streams</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <StatsBand stats={stats} />

      {/* mission & vision */}
      <section className="relative overflow-hidden bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="What guides us"
              title="Mission, vision and the values we live by"
              text="Everything we do is anchored in a simple idea: children learn best when they feel known, safe and inspired."
            />
          </Reveal>
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <Reveal direction="left">
              <article className="relative h-full overflow-hidden rounded-[1.75rem] bg-green-200 p-7 sm:p-9">
                <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/50" />
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue">
                  <Icon name="sparkle" className="h-5 w-5" />
                </span>
                <h3 className="relative mt-6 text-2xl text-navy-900">Our mission</h3>
                <p className="relative mt-3 max-w-lg text-[14.5px] leading-relaxed text-navy/70">{content.mission}</p>
              </article>
            </Reveal>
            <Reveal direction="right" delay={0.08}>
              <article className="relative h-full overflow-hidden rounded-[1.75rem] bg-blush p-7 sm:p-9">
                <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/50" />
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#b23a6b]">
                  <Icon name="eye" className="h-5 w-5" />
                </span>
                <h3 className="relative mt-6 text-2xl text-navy-900">Our vision</h3>
                <p className="relative mt-3 max-w-lg text-[14.5px] leading-relaxed text-navy/70">{content.vision}</p>
              </article>
            </Reveal>
          </div>

          {content.values.length > 0 && (
            <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {content.values.map((value, i) => (
                <RevealItem key={value.title}>
                  <article className="group h-full rounded-[1.5rem] border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue/25 hover:shadow-soft">
                    <span className="font-display text-[2rem] font-semibold text-navy/10">0{i + 1}</span>
                    <h3 className="mt-2 text-[17px] text-navy-900">{value.title}</h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{value.text}</p>
                  </article>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>

      {/* why choose + facilities */}
      <section className="relative overflow-hidden bg-cream py-20 sm:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid text-navy/[0.035]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <Reveal>
                <SectionHeading
                  align="left"
                  eyebrow="Why choose Kids Island"
                  eyebrowTone="mint"
                  title="A caring school that knows every child"
                  className="[&_h2]:max-w-md"
                />
              </Reveal>
              <div className="mt-8 space-y-3">
                {content.whyChoose.map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.06} direction="left">
                    <div className="flex gap-4 rounded-2xl border border-white bg-white/80 p-5 backdrop-blur">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-[#167a4a]">
                        <Icon name="check" className="h-5 w-5" strokeWidth={2.4} />
                      </span>
                      <div>
                        <h3 className="text-[16px] text-navy-900">{item.title}</h3>
                        <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.text}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal direction="right" delay={0.1}>
              <div className="rounded-[2rem] border border-white bg-white p-7 shadow-soft">
                <h3 className="text-xl text-navy-900">Facilities on campus</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  Everyday spaces that support learning, play and discovery.
                </p>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {content.facilities.map((facility) => (
                    <li key={facility} className="flex items-start gap-2.5 rounded-xl bg-paper-2 px-3.5 py-3 text-[12.5px] font-bold text-navy/75">
                      <Icon name="check-circle" className="mt-0.5 h-4 w-4 shrink-0 text-[#4FBF7B]" />
                      {facility}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/gallery"
                  className="mt-5 inline-flex items-center gap-2 text-[12.5px] font-extrabold text-blue"
                >
                  Explore the campus gallery
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="bg-paper">
        <section className="bg-navy px-5 py-16 text-center sm:px-8">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-balance text-[clamp(1.9rem,4vw,2.6rem)] leading-tight text-white">
              Come and see what a <span className="text-yellow">joyful school day</span> looks like.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[14.5px] text-white/60">
              Book a campus visit or send us an inquiry - we would love to meet your family.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button href="/admissions#inquiry">Apply for admission</Button>
              <Button href="/contact#visit" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                Book a visit
              </Button>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
