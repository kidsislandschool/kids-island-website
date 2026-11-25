"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SceneArt } from "@/components/ui/scene-art";
import { Icon, type IconName } from "@/components/ui/icon";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type SequenceItem = {
  step: string;
  title: string;
  text: string;
  variant?: string;
};

const CARD_TONES = [
  { bg: "bg-cream", accent: "text-amber", chip: "bg-yellow-100 text-navy", scene: "classroom" },
  { bg: "bg-blush", accent: "text-[#b23a6b]", chip: "bg-white/70 text-[#b23a6b]", scene: "science" },
  { bg: "bg-mint", accent: "text-[#167a4a]", chip: "bg-white/70 text-[#167a4a]", scene: "library" },
  { bg: "bg-green-200", accent: "text-blue", chip: "bg-white/70 text-blue", scene: "play" },
];

/**
 * GSAP ScrollTrigger pinned scroll sequence.
 *
 * The "Why Choose Kids Island" section pins for four scroll steps. Panels
 * cross-slide as the user scrubs, the step rail fills and the step counter
 * updates. Only initialised on desktop without reduced-motion; mobile and
 * reduced-motion users get a clean stacked grid instead.
 */
export function PinnedSequence({
  eyebrow,
  heading,
  intro,
  items,
  id = "why",
}: {
  eyebrow: string;
  heading: React.ReactNode;
  intro?: string;
  items: SequenceItem[];
  id?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin) return;

    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-seq-panel]", pin);
      const dots = gsap.utils.toArray<HTMLElement>("[data-seq-dot]", pin);
      const counter = pin.querySelector<HTMLElement>("[data-seq-counter]");
      const hint = pin.querySelector<HTMLElement>("[data-seq-hint]");
      const rail = pin.querySelector<HTMLElement>("[data-seq-rail]");
      if (panels.length < 2) return;

      gsap.set(panels.slice(1), { autoAlpha: 0, y: 64, scale: 0.97 });
      gsap.set(panels[0], { autoAlpha: 1, y: 0, scale: 1 });
      if (rail) gsap.set(rail, { scaleY: 0, transformOrigin: "top center" });

      const tl = gsap.timeline({
        defaults: { duration: 0.8, ease: "power2.inOut" },
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${panels.length * 70}%`,
          pin: true,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (hint) hint.style.opacity = self.progress > 0.03 ? "0" : "1";
          },
        },
      });

      tl.to({}, { duration: 0.3 });

      panels.forEach((panel, i) => {
        if (i === 0) return;
        tl.to(
          panels[i - 1],
          { autoAlpha: 0, y: -64, scale: 0.97, duration: 0.6, ease: "power2.in" },
          "+=0.22"
        ).to(
          panel,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.72, ease: "power3.out" },
          "<0.12"
        );
      });

      tl.to({}, { duration: 0.4 });
      const total = tl.duration();
      if (rail) {
        tl.to(rail, { scaleY: 1, duration: total, ease: "none" }, 0);
      }

      const setActive = () => {
        const progress = tl.progress();
        const active = Math.min(dots.length - 1, Math.floor(progress * dots.length * 0.999));
        dots.forEach((dot, i) => {
          if (i === active) dot.setAttribute("data-active", "true");
          else dot.removeAttribute("data-active");
        });
        if (counter) {
          counter.textContent = String(active + 1).padStart(2, "0");
        }
      };
      setActive();
      tl.eventCallback("onUpdate", setActive);

      // GSAP timing constants mirror the Framer tokens.
      gsap.delayedCall(0, () => ScrollTrigger.refresh());
    }, rootRef);

    const onResize = () => {
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        ScrollTrigger.getAll().forEach((st) => st.kill());
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id={id}
      ref={rootRef}
      className="relative bg-navy text-white"
      aria-labelledby={`${id}-title`}
    >
      {/* ------------------------------------------------ desktop pinned view */}
      <div className="ki-pin">
        <div ref={pinRef} className="relative flex min-h-svh items-center overflow-hidden py-16">
          <div aria-hidden className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,#1c4478_0%,#12325c_45%,#0a1c38_100%)]" />
            <div className="dot-grid absolute inset-0 text-white/[0.045]" />
            <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-green-200/20 blur-[100px]" />
            <div className="absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-yellow/15 blur-[120px]" />
            <svg viewBox="0 0 1440 120" className="absolute bottom-0 h-24 w-full opacity-[0.06]" preserveAspectRatio="none">
              <path fill="#fff" d="M0,66 C58,66 58,28 116,28 C174,28 174,64 232,64 C290,64 290,16 348,16 C406,16 406,74 464,74 C522,74 522,38 580,38 C638,38 638,86 696,86 C754,86 754,26 812,26 C870,26 870,62 928,62 C986,62 986,14 1044,14 C1102,14 1102,52 1160,52 C1218,52 1218,34 1276,34 C1334,34 1334,68 1440,68 L1440,120 L0,120 Z" />
            </svg>
          </div>

          <div className="relative mx-auto grid w-full max-w-7xl grid-cols-[0.92fr_1.08fr] items-center gap-14 px-8 xl:gap-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-yellow">
                <Icon name="star" className="h-3.5 w-3.5" /> {eyebrow}
              </span>
              <h2
                id={`${id}-title`}
                className="mt-5 max-w-xl text-balance text-[clamp(2.4rem,3.6vw,3.6rem)] leading-[1.04] text-white"
              >
                {heading}
              </h2>
              {intro && <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/65">{intro}</p>}

              <div className="mt-10 flex items-stretch gap-5">
                <div className="relative w-px shrink-0 bg-white/15">
                  <div data-seq-rail className="absolute inset-x-0 top-0 h-full origin-top bg-yellow" />
                </div>
                <ul className="flex flex-col gap-4" aria-label="Steps">
                  {items.map((item, i) => (
                    <li
                      key={item.step}
                      data-seq-dot
                      className="group flex items-center gap-3 text-sm font-bold text-white/40 transition-colors duration-300 data-[active=true]:text-white"
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/5 text-[11px] transition-colors duration-300 group-data-[active=true]:border-yellow group-data-[active=true]:bg-yellow group-data-[active=true]:text-navy-900">
                        {item.step}
                      </span>
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 flex items-baseline gap-2">
                <span data-seq-counter className="font-display text-3xl font-semibold text-yellow">01</span>
                <span className="text-xs font-bold tracking-[0.2em] text-white/35">
                  / {String(items.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="relative h-[560px]">
              {items.map((item, i) => {
                const tone = CARD_TONES[i % CARD_TONES.length];
                return (
                  <article
                    key={`${item.step}-${item.title}`}
                    data-seq-panel
                    className="absolute inset-0"
                    style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
                  >
                    <div
                      className={cn(
                        "flex h-full flex-col justify-between overflow-hidden rounded-[2.2rem] p-8 text-navy-900 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)] xl:p-9",
                        tone.bg
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-display text-[4.6rem] font-semibold leading-none tracking-tight text-navy/15">
                          {item.step}
                        </span>
                        <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em]", tone.chip)}>
                          Why Kids Island
                        </span>
                      </div>

                      <div className="mt-6 overflow-hidden rounded-2xl">
                        <SceneArt variant={item.variant || tone.scene} className="h-40 w-full" />
                      </div>

                      <div className="mt-auto pt-6">
                        <h3 className="text-[1.9rem] leading-tight text-navy-900">{item.title}</h3>
                        <p className="mt-2.5 max-w-md text-[15.5px] leading-relaxed text-navy/70">{item.text}</p>
                      </div>

                      <div className="mt-6 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.16em] text-navy/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        Step {i + 1} of {items.length}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div
            data-seq-hint
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40 transition-opacity duration-500"
          >
            <Icon name="arrow-down" className="h-3.5 w-3.5" /> Scroll to explore
          </div>
        </div>
      </div>

      {/* ------------------------------------- mobile / reduced-motion layout */}
      <div className="ki-pin-static relative overflow-hidden px-5 py-20 sm:px-8">
        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-yellow">
            <Icon name="star" className="h-3.5 w-3.5" /> {eyebrow}
          </span>
          <h2 className="mt-5 text-balance text-[clamp(2rem,6vw,2.8rem)] leading-[1.07] text-white">{heading}</h2>
          {intro && <p className="mt-4 text-[15.5px] leading-relaxed text-white/65">{intro}</p>}
          <div className="mt-10 flex flex-col gap-4">
            {items.map((item, i) => {
              const tone = CARD_TONES[i % CARD_TONES.length];
              return (
                <article key={`${item.step}-m-${item.title}`} className={cn("rounded-3xl p-6 text-navy-900", tone.bg)}>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-4xl font-semibold text-navy/20">{item.step}</span>
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em]", tone.chip)}>
                      Why Kids Island
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-navy/70">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
