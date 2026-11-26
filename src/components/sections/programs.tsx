import Link from "next/link";
import { RevealGroup, RevealItem, Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Program = { title: string; stage: string; text: string; variant: string };

const TONES: Record<string, { card: string; chip: string; icon: string }> = {
  pink: { card: "bg-blush", chip: "bg-white/75 text-[#b23a6b]", icon: "bg-white/70 text-[#b23a6b]" },
  blue: { card: "bg-green-200", chip: "bg-white/75 text-blue", icon: "bg-white/70 text-blue" },
  green: { card: "bg-mint", chip: "bg-white/75 text-[#167a4a]", icon: "bg-white/70 text-[#167a4a]" },
  amber: { card: "bg-yellow-100", chip: "bg-white/75 text-[#8a5a00]", icon: "bg-white/70 text-[#8a5a00]" },
};

export function ProgramsSection({ programs }: { programs: Program[] }) {
  if (!programs.length) return null;
  return (
    <section className="relative bg-paper py-20 sm:py-24" aria-labelledby="programs-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Academic programs"
              title={
                <>
                  A pathway for every <span className="wave-underline">stage of learning</span>
                </>
              }
              text="From first steps in nursery to focused senior-secondary streams, each stage is built to help children grow with confidence."
              className="[&_h2]:max-w-xl"
            />
          </Reveal>
          <Reveal delay={0.1} className="hidden md:block">
            <Button href="/academics" variant="outline" className="group/btn">
              Explore academics
              <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Reveal>
        </div>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {programs.map((program, i) => {
            const tone = TONES[program.variant] ?? TONES.blue;
            return (
              <RevealItem key={program.title} className="h-full">
                <Link
                  href="/academics"
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-6 transition-transform duration-300 hover:-translate-y-1.5 focus-visible:-translate-y-1.5",
                    tone.card
                  )}
                >
                  <div aria-hidden className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/40" />
                  <div aria-hidden className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-white/25" />
                  <div className="relative flex items-start justify-between">
                    <span className={cn("grid h-12 w-12 place-items-center rounded-2xl", tone.icon)}>
                      <Icon
                        name={
                          i === 0 ? "book" :
                          i === 1 ? "graduation" :
                          i === 2 ? "sparkle" :
                          i === 3 ? "star" :
                          i === 4 ? "trophy" : "heart"
                        }
                        className="h-5.5 w-5.5"
                        strokeWidth={1.8}
                      />
                    </span>
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em]", tone.chip)}>
                      0{i + 1}
                    </span>
                  </div>
                  <span className="relative mt-6 inline-block w-fit rounded-full bg-white/60 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-navy/70">
                    {program.stage}
                  </span>
                  <h3 className="relative mt-3 text-[21px] leading-snug text-navy-900">{program.title}</h3>
                  <p className="relative mt-2 flex-1 text-[13.5px] leading-relaxed text-navy/65">{program.text}</p>
                  <span className="relative mt-5 inline-flex items-center gap-1.5 text-[12px] font-extrabold text-navy/70 transition-colors group-hover:text-navy">
                    Learn more
                    <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal className="mt-8 md:hidden">
          <Button href="/academics" variant="outline" full>
            Explore academics
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
