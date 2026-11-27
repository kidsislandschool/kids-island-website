"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type Testimonial = {
  id: number;
  quote: string;
  author_name: string;
  author_role?: string | null;
  image?: string | null;
};

/**
 * Crossfade testimonial carousel (Framer Motion) with AnimatePresence,
 * pause-on-hover, dot controls and keyboard support.
 */
export function TestimonialCarousel({
  testimonials,
  className,
}: {
  testimonials: Testimonial[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  useEffect(() => {
    if (reduce || paused || count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 7200);
    return () => clearInterval(t);
  }, [reduce, paused, count, index]);

  if (!count) return null;
  const t = testimonials[index];

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Parent testimonials"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          setIndex((i) => (i + 1) % count);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setIndex((i) => (i - 1 + count) % count);
        }
      }}
    >
      <div className="relative min-h-[280px] sm:min-h-[240px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={t.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: reduce ? 0.01 : DURATION.md, ease: EASE.out }}
            className="absolute inset-0"
          >
            <div className="flex h-full flex-col justify-between gap-8 rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-soft backdrop-blur sm:p-10">
              <div>
                <Icon name="quote" className="h-8 w-8 text-yellow" strokeWidth={1.5} />
                <blockquote className="mt-5 max-w-2xl text-balance font-display text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug text-navy-900">
                  “{t.quote}”
                </blockquote>
              </div>
              <figcaption className="flex items-center gap-3">
                {t.image ? (
                  <img
                    src={t.image}
                    alt={t.author_name}
                    className="h-11 w-11 rounded-full object-cover border border-navy/10"
                  />
                ) : (
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-navy text-[13px] font-extrabold text-white">
                    {t.author_name
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")}
                  </span>
                )}
                <span className="leading-tight">
                  <span className="block text-[14.5px] font-extrabold text-navy-900">{t.author_name}</span>
                  {t.author_role && (
                    <span className="block text-[12px] font-semibold text-muted">{t.author_role}</span>
                  )}
                </span>
              </figcaption>
            </div>
          </motion.figure>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show testimonial ${i + 1}`}
                aria-current={i === index}
                className="flex h-6 items-center px-0.5"
              >
                <motion.span
                  animate={{ width: i === index ? 26 : 8 }}
                  className={cn(
                    "block h-2 rounded-full transition-colors",
                    i === index ? "bg-navy" : "bg-navy/15 hover:bg-navy/30"
                  )}
                  transition={{ duration: DURATION.sm, ease: EASE.out }}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
              aria-label="Previous testimonial"
              className="grid h-10 w-10 place-items-center rounded-full border border-navy/10 bg-white text-navy transition hover:bg-cream"
            >
              <Icon name="chevron-left" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % count)}
              aria-label="Next testimonial"
              className="grid h-10 w-10 place-items-center rounded-full border border-navy/10 bg-white text-navy transition hover:bg-cream"
            >
              <Icon name="chevron-right" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
