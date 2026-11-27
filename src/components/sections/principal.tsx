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
  eyebrow?: string;
};

export function PrincipalMessage({ content }: { content: PrincipalContent }) {
  return (
    <section className="relative overflow-hidden bg-paper py-20 sm:py-24" aria-labelledby="school-message">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Photo at the top, centered */}
        {content.photo && (
          <Reveal className="mb-12">
            <div className="relative mx-auto max-w-md sm:max-w-lg">
              <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-white shadow-lift">
                <CmsImage
                  src={content.photo}
                  alt="Ms. Tara Jabeen, Managing Director"
                  variant="school"
                  className="aspect-[4/5] w-full"
                />
              </div>
              <div className="absolute -right-4 -top-5 grid h-16 w-16 place-items-center rounded-2xl bg-yellow text-navy-900 shadow-[0_18px_36px_-14px_rgba(255,159,28,0.7)]">
                <Icon name="quote" className="h-7 w-7" strokeWidth={1.6} />
              </div>
              <Sparkle className="absolute -bottom-4 right-8 h-7 w-7" />
            </div>
          </Reveal>
        )}

        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow={content.eyebrow ?? "A Message from the Managing Director"}
              eyebrowTone="pink"
              title={content.heading}
            />
          </Reveal>
          <Reveal delay={0.08}>
            <blockquote id="school-message" className="mt-6 text-[16px] leading-relaxed text-muted whitespace-pre-line">
              {content.body}
            </blockquote>
          </Reveal>
          <Reveal delay={0.14} className="mt-8 flex flex-col items-center gap-2">
            <div>
              <p className="font-display text-[16px] font-semibold text-navy-900 whitespace-pre-line">{content.authorName}</p>
              <p className="text-[12px] font-bold text-muted whitespace-pre-line">{content.authorRole}</p>
            </div>
            <Button href="/about" variant="outline" size="sm" className="group/btn mt-4">
              Our story
              <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}