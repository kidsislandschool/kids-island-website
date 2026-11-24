import { Reveal } from "@/components/motion/reveal";
import { CmsImage } from "@/components/ui/cms-image";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/clouds";

export type PrincipalContent = {
  heading: string;
  body: string;
  authorName: string;
  authorRole: string;
  photo: string | null;
  note?: string;
};

export function PrincipalMessage({ content }: { content: PrincipalContent }) {
  return (
    <section className="relative overflow-hidden bg-paper py-20 sm:py-24" aria-labelledby="school-message">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal direction="left" className="relative mx-auto w-full max-w-md lg:mx-0">
            <div aria-hidden className="absolute -left-3 -top-3 h-full w-full rounded-[2rem] border-2 border-dashed border-yellow/60" />
            <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-white shadow-lift">
              <CmsImage
                src={content.photo}
                alt="Kids Island school building"
                variant="school"
                className="aspect-[5/4] w-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/60 to-transparent p-5 pt-12">
                <p className="font-display text-lg text-white">Our school, our promise</p>
                <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-white/65">
                  Aligarh, Uttar Pradesh
                </p>
              </div>
            </div>
            <div className="absolute -right-4 -top-5 grid h-16 w-16 place-items-center rounded-2xl bg-yellow text-navy-900 shadow-[0_18px_36px_-14px_rgba(255,159,28,0.7)]">
              <Icon name="quote" className="h-7 w-7" strokeWidth={1.6} />
            </div>
            <Sparkle className="absolute -bottom-4 right-8 h-7 w-7" />
          </Reveal>

          <div>
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="A message from the school"
                eyebrowTone="pink"
                title={content.heading}
                className="[&_h2]:max-w-xl"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <blockquote id="school-message" className="mt-6 border-l-4 border-yellow pl-5 text-[16px] leading-relaxed text-muted">
                {content.body}
              </blockquote>
            </Reveal>
            <Reveal delay={0.14} className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-[16px] font-semibold text-navy-900">{content.authorName}</p>
                <p className="text-[12px] font-bold text-muted">{content.authorRole}</p>
              </div>
              <Button href="/about" variant="outline" size="sm" className="group/btn">
                Our story
                <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
