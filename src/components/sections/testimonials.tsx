import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { TestimonialCarousel, type Testimonial } from "@/components/motion/testimonial-carousel";
import { Icon } from "@/components/ui/icon";
import { Cloud } from "@/components/ui/clouds";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null;
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFF1F6_0%,#FFFDF9_100%)] py-20 sm:py-24" aria-labelledby="testimonials-title">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="dot-grid absolute inset-0 text-navy/[0.03]" />
        <Cloud className="absolute -left-8 top-16 w-40 opacity-70" fill="#ffffff" />
        <Cloud className="absolute -right-6 bottom-16 w-28 opacity-60" fill="#ffffff" />
        <div className="absolute right-[12%] top-10 h-40 w-40 rounded-full bg-yellow/15 blur-[60px]" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Parent voices"
            eyebrowTone="pink"
            title={
              <>
                Families who <span className="wave-underline">belong here</span>
              </>
            }
            text="Words from parents in our community — published only after the school confirms authenticity and permission."
            className="[&_h2]:max-w-md"
          />
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white bg-white/70 px-4 py-3 text-[12px] font-bold text-muted backdrop-blur w-fit">
            <Icon name="heart" className="h-4 w-4 text-[#E86A8A]" />
            Every testimonial is reviewed by the school office.
          </div>
        </Reveal>
        <Reveal delay={0.1} direction="left">
          <TestimonialCarousel testimonials={testimonials} />
        </Reveal>
      </div>
    </section>
  );
}
