import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CmsImage } from "@/components/ui/cms-image";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildPageMetadata("/academics", {
    title: "Academics",
    description: "Academic programmes at Kids Island Senior Secondary School, Aligarh.",
  });
}

type Stage = {
  title: string;
  classes: string;
  text: string;
  points: string[];
  variant: string;
};

type AcademicsPage = { heading: string; intro: string; stages: Stage[] };

const FALLBACK: AcademicsPage = {
  heading: "Academics at Kids Island",
  intro: "A clear learning pathway from the early years to senior secondary.",
  stages: [],
};

const ACCENTS: Record<string, { bg: string; icon: string; chip: string; scene: string }> = {
  pink: { bg: "bg-blush", icon: "bg-white text-[#b23a6b]", chip: "bg-white/70 text-[#b23a6b]", scene: "classroom" },
  blue: { bg: "bg-skyblue", icon: "bg-white text-blue", chip: "bg-white/70 text-blue", scene: "science" },
  green: { bg: "bg-mint", icon: "bg-white text-[#167a4a]", chip: "bg-white/70 text-[#167a4a]", scene: "library" },
  amber: { bg: "bg-yellow-100", icon: "bg-white text-[#8a5a00]", chip: "bg-white/70 text-[#8a5a00]", scene: "play" },
};

export default function AcademicsPage() {
  const content = getContent<AcademicsPage>("academics.page", FALLBACK);

  return (
    <>
      <PageHero
        tone="mint"
        breadcrumb="Academics"
        eyebrow="Academics"
        title={<>A clear path from <span className="wave-underline">first steps</span> to senior secondary</>}
        intro={content.intro}
      >
        <Button href="/admissions#inquiry" className="group/btn">
          Start an admission enquiry
          <ButtonArrow />
        </Button>
      </PageHero>

      <section className="relative bg-paper py-20 sm:py-24" aria-label="Academic stages">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Learning stages"
              eyebrowTone="blue"
              title="Built stage by stage, with care at every step"
              text="Each programme balances strong fundamentals with the confidence, creativity and character that children carry for life."
            />
          </Reveal>

          <div className="mt-14 flex flex-col gap-6">
            {content.stages.map((stage, i) => {
              const tone = ACCENTS[stage.variant] ?? ACCENTS.blue;
              return (
                <Reveal key={stage.title} direction={i % 2 === 0 ? "left" : "right"}>
                  <article
                    className={cn(
                      "grid items-center gap-8 overflow-hidden rounded-[2rem] border border-line bg-white p-3 shadow-[0_18px_50px_-38px_rgba(18,50,92,0.5)] sm:p-4 lg:grid-cols-2 lg:gap-10",
                      i % 2 === 1 && "lg:[&>*:first-child]:order-2"
                    )}
                  >
                    <div className="relative overflow-hidden rounded-[1.5rem]">
                      <CmsImage
                        alt={`${stage.title} at Kids Island`}
                        variant={tone.scene}
                        className="aspect-[16/11] w-full"
                      />
                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/95 font-display text-sm font-semibold text-navy shadow-sm">
                          0{i + 1}
                        </span>
                        <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] backdrop-blur", tone.chip)}>
                          {stage.classes}
                        </span>
                      </div>
                    </div>

                    <div className="px-3 pb-4 sm:px-5 lg:py-4 lg:pr-8">
                      <span className={cn("inline-grid h-11 w-11 place-items-center rounded-2xl", tone.bg, tone.icon)}>
                        <Icon
                          name={i === 0 ? "book" : i === 1 ? "graduation" : i === 2 ? "sparkle" : "star"}
                          className="h-5 w-5"
                        />
                      </span>
                      <h2 className="mt-4 text-[clamp(1.55rem,2.6vw,2rem)] leading-tight text-navy-900">{stage.title}</h2>
                      <p className="mt-2 max-w-lg text-[14.5px] leading-relaxed text-muted">{stage.text}</p>
                      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                        {stage.points.map((point) => (
                          <li key={point} className="flex items-start gap-2 rounded-xl bg-paper-2 px-3 py-2.5 text-[12px] font-bold text-navy/75">
                            <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#167a4a]" strokeWidth={2.6} />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-8">
            <div className="flex items-start gap-3 rounded-2xl border border-line bg-cream px-5 py-4">
              <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              <p className="text-[12.5px] font-semibold leading-relaxed text-navy/70">
                Detailed curriculum documents and board affiliation information are being reviewed with the school
                office. Please contact us for the latest confirmed details.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-cream py-16 sm:py-20">
        <div aria-hidden className="absolute inset-0 dot-grid text-navy/[0.035]" />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Next step"
              eyebrowTone="yellow"
              title="Ready to see the classrooms in person?"
              text="Book a campus visit, meet the team, and ask us anything about your child's stage of learning."
            />
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button href="/admissions#inquiry" size="lg" className="group/btn">
                Apply for admission
                <ButtonArrow />
              </Button>
              <Button href="/contact#visit" size="lg" variant="white">
                Book a campus visit
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
