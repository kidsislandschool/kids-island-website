import { Reveal } from "@/components/motion/reveal";
import { Button, ButtonArrow } from "@/components/ui/button";
import { CmsImage } from "@/components/ui/cms-image";
import { Cloud, Sparkle } from "@/components/ui/clouds";
import { Icon } from "@/components/ui/icon";

export type CtaContent = {
  title: string;
  text: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

export function AdmissionsCta({ content }: { content: CtaContent }) {
  return (
    <section className="relative bg-paper py-16 sm:py-20" aria-labelledby="admissions-cta">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal direction="scale">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-navy px-6 py-10 shadow-[0_40px_80px_-40px_rgba(18,50,92,0.6)] sm:px-10 lg:px-14 lg:py-14">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,#1c4478_0%,transparent_55%)]" />
              <div className="dot-grid absolute inset-0 text-white/[0.05]" />
              <Cloud className="absolute -left-10 -top-8 w-40 opacity-10" fill="#fff" />
              <Cloud className="absolute bottom-0 left-1/3 w-24 opacity-[0.07]" fill="#fff" />
              <Sparkle className="absolute right-6 top-6 h-7 w-7 opacity-60" />
            </div>

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-yellow">
                  <Icon name="megaphone" className="h-3.5 w-3.5" /> Admissions
                </span>
                <h2 id="admissions-cta" className="mt-5 max-w-xl text-balance text-[clamp(2rem,4.4vw,3rem)] leading-[1.06] text-white">
                  {content.title}
                </h2>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/65">{content.text}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button href={content.primary.href} size="lg" className="group/btn">
                    {content.primary.label}
                    <ButtonArrow />
                  </Button>
                  <Button
                    href={content.secondary.href}
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
                  >
                    {content.secondary.label}
                  </Button>
                </div>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12px] font-bold text-white/55">
                  <span className="flex items-center gap-1.5">
                    <Icon name="check-circle" className="h-4 w-4 text-yellow" /> Simple 4-step process
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="check-circle" className="h-4 w-4 text-yellow" /> Guided campus visit
                  </span>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-sm lg:ml-auto">
                <div className="rotate-[-3deg] overflow-hidden rounded-[1.75rem] border-[5px] border-white/10 bg-white/5 p-2 shadow-2xl">
                  <CmsImage
                    src="/images/main.png"
                    alt="Kids Island Senior Secondary School campus"
                    className="aspect-[5/4] w-full rounded-[1.3rem] object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl bg-yellow px-4 py-3 shadow-xl sm:-left-6">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/60 text-navy-900">
                    <Icon name="graduation" className="h-5 w-5" />
                  </span>
                  <div className="leading-tight text-navy-900">
                    <p className="text-[13px] font-extrabold">Admissions inquiry</p>
                    <p className="text-[10.5px] font-bold text-navy/60">Nursery to Class 12</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
