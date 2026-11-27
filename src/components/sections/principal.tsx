import { Reveal } from "@/components/motion/reveal";
import { CmsImage } from "@/components/ui/cms-image";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icon";

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
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16 items-start">
          {/* Left: Founder Photo */}
          <Reveal direction="left">
            <div className="relative mx-auto max-w-md lg:mx-0">
              <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-white shadow-lift">
                <CmsImage
                  src={content.photo}
                  alt="Ms. Tara Jabeen, Managing Director"
                  variant="school"
                  className="aspect-[4/5] w-full"
                />
              </div>
            </div>
          </Reveal>

          {/* Right: Message Text */}
          <div className="flex flex-col justify-center">
            <Reveal direction="right">
              <SectionHeading
                align="left"
                eyebrow={content.eyebrow ?? "A Message from the Managing Director"}
                eyebrowTone="pink"
                title={content.heading}
              />
            </Reveal>
            <Reveal delay={0.08} direction="right">
              <blockquote id="school-message" className="mt-6 border-l-4 border-yellow pl-6 text-[16px] leading-relaxed text-muted whitespace-pre-line">
                {content.body}
              </blockquote>
            </Reveal>
            <Reveal delay={0.14} className="mt-8 flex flex-col gap-2">
              <div>
                <p className="font-display text-[16px] font-semibold text-navy-900 whitespace-pre-line">{content.authorName}</p>
                <p className="text-[12px] font-bold text-muted whitespace-pre-line">{content.authorRole}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}