"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CrossfadeSlideshow, type Slide } from "@/components/motion/crossfade-slideshow";
import { Button, ButtonArrow } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Cloud, Sparkle } from "@/components/ui/clouds";
import { prefersReducedMotion } from "@/lib/motion";

export type HeroContent = {
  eyebrow: string;
  headline: string;
  intro: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  badges: string[];
  slides: Slide[];
};

/** Highlight the phrase "bright futures" without trusting arbitrary HTML. */
function Headline({ text }: { text: string }) {
  const phrase = "bright futures";
  const lower = text.toLowerCase();
  const at = lower.indexOf(phrase);
  if (at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="relative inline-block">
        {text.slice(at, at + phrase.length)}
        <svg
          viewBox="0 0 300 22"
          preserveAspectRatio="none"
          aria-hidden
          className="absolute -bottom-1 left-0 h-[0.24em] w-full text-yellow"
        >
          <path d="M4 16C60 6 140 4 296 10" stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none" opacity=".75" />
        </svg>
      </span>
      {text.slice(at + phrase.length)}
    </>
  );
}

/**
 * Homepage hero: GSAP entrance + scroll parallax + pointer parallax over a
 * Framer crossfade slideshow. All timing values mirror `lib/motion.ts`.
 */
export function Hero({ content, affiliation }: { content: HeroContent; affiliation?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const collage = collageRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (!reduce) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.72 }, delay: 0.08 });
        tl.from("[data-hero-rise]", { y: 30, opacity: 0, stagger: 0.09 })
          .from(
            "[data-hero-collage]",
            { y: 36, opacity: 0, scale: 0.965, rotate: 1.5, duration: 0.9 },
            0.18
          )
          .from(
            "[data-hero-float]",
            { opacity: 0, y: 18, scale: 0.92, stagger: 0.12, duration: 0.5, ease: "back.out(1.6)" },
            0.7
          );

        // Scroll parallax on decorative layers.
        gsap.utils.toArray<HTMLElement>("[data-hero-parallax]").forEach((layer) => {
          const depth = Number(layer.dataset.heroParallax || 1);
          gsap.to(layer, {
            y: 50 * depth,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        });
      }

      // Localised pointer parallax (desktop pointers only).
      const fine = window.matchMedia("(pointer: fine)").matches;
      if (!fine || reduce || !collage) return;

      const tilt = collage.querySelector<HTMLElement>("[data-hero-tilt]");
      const cloudA = collage.querySelector<HTMLElement>("[data-hero-cloud-a]");
      const cloudB = collage.querySelector<HTMLElement>("[data-hero-cloud-b]");
      const xTo = gsap.quickTo(tilt, "x", { duration: 0.9, ease: "power3.out" });
      const yTo = gsap.quickTo(tilt, "y", { duration: 0.9, ease: "power3.out" });
      const cax = gsap.quickTo(cloudA, "x", { duration: 1.2, ease: "power3.out" });
      const cay = gsap.quickTo(cloudA, "y", { duration: 1.2, ease: "power3.out" });
      const cbx = gsap.quickTo(cloudB, "x", { duration: 1.4, ease: "power3.out" });
      const cby = gsap.quickTo(cloudB, "y", { duration: 1.4, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        const rect = root.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        xTo(nx * 18);
        yTo(ny * 14);
        cax(nx * -34);
        cay(ny * -20);
        cbx(nx * 22);
        cby(ny * 16);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
        cax(0);
        cay(0);
        cbx(0);
        cby(0);
      };
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);
      return () => {
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
      };
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#fffdf9_0%,#fff8e9_55%,#fffdf9_100%)]"
      aria-labelledby="hero-title"
    >
      {/* decorative backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="dot-grid absolute inset-0 text-navy/[0.05]" />
        <div className="absolute -left-40 top-24 h-[28rem] w-[28rem] rounded-full bg-skyblue/70 blur-[90px]" />
        <div className="absolute -right-32 top-10 h-[26rem] w-[26rem] rounded-full bg-yellow/20 blur-[100px]" />
        <Cloud
          data-hero-parallax="0.5"
          className="absolute left-[4%] top-24 w-32 text-white/90 sm:w-40"
          fill="#ffffff"
        />
        <Cloud
          data-hero-parallax="1.1"
          className="absolute right-[6%] top-16 w-24 text-white/80 sm:w-32"
          fill="#ffffff"
          opacity={0.85}
        />
        <Cloud
          data-hero-parallax="1.6"
          className="absolute -bottom-6 left-[22%] w-40 text-white/70"
          fill="#ffffff"
          opacity={0.7}
        />
        <Sparkle className="absolute left-[42%] top-16 h-5 w-5 opacity-70" />
        <Sparkle className="absolute right-[38%] top-40 h-3 w-3 opacity-60" fill="#FF9F1C" />
        <svg
          className="absolute -right-6 bottom-10 h-24 w-24 text-yellow/40"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden
        >
          <path d="M50 12c6 26 16 36 42 42-26 6-36 16-42 42-6-26-16-36-42-42 26-6 36-16 42-42Z" stroke="currentColor" strokeWidth="3" />
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-12 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-8 lg:pb-28 lg:pt-16">
        <div className="max-w-xl">
          <div data-hero-rise className="inline-flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white/85 px-3.5 py-1.5 text-[12.5px] font-extrabold text-navy shadow-sm backdrop-blur">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-yellow text-navy-900">
                <Icon name="sparkle" className="h-3 w-3" strokeWidth={2.4} />
              </span>
              {content.eyebrow}
            </span>
            {affiliation && (
              <span className="rounded-full bg-mint px-3 py-1.5 text-[11.5px] font-extrabold text-[#167a4a]">
                {affiliation}
              </span>
            )}
          </div>

          <h1
            id="hero-title"
            data-hero-rise
            className="mt-6 text-balance text-[clamp(2.55rem,5.6vw,4.35rem)] leading-[1.02] tracking-[-0.03em] text-navy-900"
          >
            <Headline text={content.headline} />
          </h1>

          <p data-hero-rise className="mt-6 max-w-lg text-[17px] leading-relaxed text-muted">
            {content.intro}
          </p>

          <div data-hero-rise className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={content.primaryCta.href} size="lg" className="group/btn">
              {content.primaryCta.label}
              <ButtonArrow />
            </Button>
            <Button href={content.secondaryCta.href} variant="outline" size="lg">
              {content.secondaryCta.label}
            </Button>
          </div>

          <ul data-hero-rise className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[13.5px] font-bold text-navy/70">
            {content.badges.map((badge) => (
              <li key={badge} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-mint text-[#167a4a]">
                  <Icon name="check" className="h-3 w-3" strokeWidth={2.8} />
                </span>
                {badge}
              </li>
            ))}
          </ul>
        </div>

        {/* ------------------------------------------------------ collage */}
        <div className="relative mx-auto w-full max-w-[480px] lg:max-w-none" data-hero-collage>
          <div
            aria-hidden
            className="absolute -right-4 -top-5 h-40 w-40 rounded-[2.5rem] bg-yellow/35 blur-2xl sm:h-52 sm:w-52"
          />
          <Cloud
            data-hero-cloud-a
            className="absolute -left-8 top-16 z-0 w-24 sm:w-32"
            fill="#ffffff"
            opacity={0.95}
          />
          <Cloud
            data-hero-cloud-b
            className="absolute -right-5 bottom-24 z-20 w-20 sm:w-28"
            fill="#ffffff"
            opacity={0.9}
          />

          <div data-hero-tilt className="relative z-10">
            <div className="relative rotate-[1.6deg] rounded-[2.4rem] border-[6px] border-white bg-white shadow-[0_40px_80px_-30px_rgba(18,50,92,0.45)]">
              <CrossfadeSlideshow
                slides={content.slides}
                className="aspect-[4/4.6] sm:aspect-[5/5] lg:aspect-[4/4.7]"
                rounded="rounded-[1.9rem]"
                priority
                ariaLabel="Life at Kids Island"
              />
            </div>

            {/* floating year / classes card */}
            <div
              data-hero-float
              className="absolute -left-3 top-6 z-20 flex items-center gap-3 rounded-2xl bg-yellow px-4 py-3 shadow-[0_18px_36px_-16px_rgba(255,159,28,0.8)] sm:-left-7 sm:top-9"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/60 text-navy-900">
                <Icon name="graduation" className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="font-display text-[17px] font-semibold text-navy-900">Nursery – 12</p>
                <p className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-navy/60">
                  One caring campus
                </p>
              </div>
            </div>

            {/* floating safety card */}
            <div
              data-hero-float
              className="absolute -bottom-5 -left-2 z-20 flex items-center gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-soft backdrop-blur sm:-left-6"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-[#167a4a]">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-[13.5px] font-extrabold text-navy-900">Safe & caring</p>
                <p className="text-[11px] font-bold text-muted">A campus where children belong</p>
              </div>
            </div>

            <div
              data-hero-float
              aria-hidden
              className="absolute -right-3 top-1/3 z-20 grid h-14 w-14 place-items-center rounded-2xl bg-blue text-white shadow-[0_18px_36px_-16px_rgba(22,163,74,0.8)] sm:-right-6"
            >
              <Icon name="book" className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
