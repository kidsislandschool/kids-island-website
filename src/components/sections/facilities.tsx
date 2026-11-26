import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CmsImage } from "@/components/ui/cms-image";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Facility = { title: string; text: string; variant: string; image?: string | null };

export function FacilitiesSection({ facilities }: { facilities: Facility[] }) {
  if (!facilities.length) return null;
  return (
    <section className="relative overflow-hidden bg-cream py-20 sm:py-24" aria-labelledby="facilities-title">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="dot-grid absolute inset-0 text-navy/[0.035]" />
        <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-yellow/15 blur-[80px]" />
        <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-green-200 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow="Campus & facilities"
              eyebrowTone="blue"
              title="Spaces made for curious minds"
              text="Bright classrooms, hands-on labs, a library full of stories and room to run — the everyday setting for joyful learning."
              className="[&_h2]:max-w-xl"
            />
            <Button href="/gallery" variant="white" className="group/btn hidden md:inline-flex">
              See campus gallery
              <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility, i) => (
            <RevealItem
              key={facility.title}
              className={cn("h-full", i === 0 && "sm:col-span-2 lg:col-span-1 lg:row-span-2")}
            >
              <article
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_16px_40px_-28px_rgba(18,50,92,0.4)] transition-transform duration-300 hover:-translate-y-1",
                  i === 0 && "lg:min-h-[34rem]"
                )}
              >
                <div className={cn("relative overflow-hidden", i === 0 ? "aspect-[16/10] lg:aspect-auto lg:flex-[1.1]" : "aspect-[16/10]")}>
                  <CmsImage
                    src={facility.image}
                    alt={facility.title}
                    variant={facility.variant}
                    className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-navy shadow-sm backdrop-blur">
                    Facility
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[19px] leading-snug text-navy-900">{facility.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{facility.text}</p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-8 md:hidden">
          <Button href="/gallery" variant="white" full>
            See campus gallery
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
