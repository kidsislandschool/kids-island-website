"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { CmsImage } from "@/components/ui/cms-image";
import { Icon } from "@/components/ui/icon";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type Slide = {
  id: string | number;
  label?: string;
  variant?: string;
  image?: string | null;
  alt?: string;
};

/**
 * Crossfade slideshow (Framer Motion).
 *
 * Used for the hero collage, facilities strip and gallery preview. Images
 * crossfade with a gentle scale drift; auto-advance pauses on hover/focus and
 * is disabled entirely for reduced-motion users.
 */
export function CrossfadeSlideshow({
  slides,
  interval = 5200,
  className,
  imgClassName,
  showControls = true,
  showLabel = true,
  rounded = "rounded-[2rem]",
  priority = false,
  ariaLabel = "Photo slideshow",
}: {
  slides: Slide[];
  interval?: number;
  className?: string;
  imgClassName?: string;
  showControls?: boolean;
  showLabel?: boolean;
  rounded?: string;
  priority?: boolean;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  useEffect(() => {
    if (reduce || paused || count < 2) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, interval);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reduce, paused, count, interval, index]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (count === 0) return null;

  const active = slides[index];
  const fade = reduce ? 0.01 : DURATION.crossfade;
  // Disable scale animation (Ken Burns effect) when using SVG fallback to prevent rendering glitches
  const isUsingFallback = !active.image;

  return (
    <div
      className={cn("group relative overflow-hidden", rounded, className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(index + 1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(index - 1);
        }
      }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fade, ease: EASE.inOut }}
          className="absolute inset-0"
          aria-hidden={false}
        >
          <motion.div
            className="h-full w-full"
            initial={{ scale: reduce || isUsingFallback ? 1 : 0.96 }}
            animate={{ scale: 1 }}
            transition={{ duration: reduce || isUsingFallback ? 0.01 : interval / 1000 * 0.9, ease: "easeOut" }}
          >
            <CmsImage
              src={active.image}
              alt={active.alt || active.label || "Kids Island school life"}
              variant={active.variant || "classroom"}
              className="h-full w-full"
              imgClassName={imgClassName}
              priority={priority}
              unoptimized={true}
            />
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/35 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {showLabel && active.label && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-3 sm:p-4">
          <AnimatePresence mode="wait">
            <motion.span
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: DURATION.sm, ease: EASE.out }}
              className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-extrabold text-navy shadow-sm backdrop-blur"
            >
              {active.label}
            </motion.span>
          </AnimatePresence>
          <span className="rounded-full bg-navy-900/45 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white/90 backdrop-blur">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
        </div>
      )}

      {showControls && count > 1 && (
        <>
          <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/85 px-1.5 py-1 shadow-sm backdrop-blur sm:top-4">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1}${slide.label ? `: ${slide.label}` : ""}`}
                aria-current={i === index}
                className="group/dot flex h-5 items-center px-0.5"
              >
                <motion.span
                  className={cn(
                    "block h-1 rounded-full transition-colors",
                    i === index ? "bg-navy" : "bg-navy/20 group-hover/dot:bg-navy/40"
                  )}
                  animate={{ width: i === index ? 20 : 6 }}
                  transition={{ duration: DURATION.sm, ease: EASE.out }}
                />
              </button>
            ))}
          </div>

          <div className="absolute bottom-3 right-3 z-10 flex gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous photo"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/92 text-navy shadow-sm backdrop-blur transition hover:bg-white"
            >
              <Icon name="chevron-left" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next photo"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/92 text-navy shadow-sm backdrop-blur transition hover:bg-white"
            >
              <Icon name="chevron-right" className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
