import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Cloud, Sparkle } from "@/components/ui/clouds";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Shared inner-page header with breadcrumb, clouds and a reveal entrance. */
export function PageHero({
  eyebrow,
  title,
  intro,
  breadcrumb,
  tone = "cream",
  children,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  breadcrumb: string;
  tone?: "cream" | "blue" | "mint" | "blush";
  children?: React.ReactNode;
  align?: "left" | "center";
}) {
  const tones = {
    cream: "bg-[linear-gradient(180deg,#FFF6E4_0%,#FFFDF9_100%)]",
    blue: "bg-[linear-gradient(180deg,#EAF3FF_0%,#FFFDF9_100%)]",
    mint: "bg-[linear-gradient(180deg,#E9F9F0_0%,#FFFDF9_100%)]",
    blush: "bg-[linear-gradient(180deg,#FFF0F5_0%,#FFFDF9_100%)]",
  } as const;

  return (
    <section className={cn("relative overflow-hidden border-b border-line/70", tones[tone])}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="dot-grid absolute inset-0 text-navy/[0.04]" />
        <Cloud className="absolute -right-10 top-10 w-44 opacity-70" fill="#fff" />
        <Cloud className="absolute left-[8%] top-24 w-24 opacity-50" fill="#fff" />
        <Sparkle className="absolute right-[22%] top-12 h-5 w-5 opacity-70" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-yellow/10 blur-[70px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-[11.5px] font-extrabold text-muted">
            <li>
              <Link href="/" className="transition-colors hover:text-navy">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-navy/20">
              /
            </li>
            <li aria-current="page" className="text-navy">
              {breadcrumb}
            </li>
          </ol>
        </nav>

        <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
          {eyebrow && (
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-navy shadow-sm">
                <Icon name="sparkle" className="h-3.5 w-3.5 text-amber" />
                {eyebrow}
              </span>
            </Reveal>
          )}
          <Reveal delay={0.05}>
            <h1 className="mt-5 text-balance text-[clamp(2.4rem,5vw,3.75rem)] leading-[1.04] tracking-[-0.03em] text-navy-900">
              {title}
            </h1>
          </Reveal>
          {intro && (
            <Reveal delay={0.1}>
              <p className={cn("mt-5 max-w-2xl text-[16.5px] leading-relaxed text-muted", align === "center" && "mx-auto")}>
                {intro}
              </p>
            </Reveal>
          )}
          {children && (
            <Reveal delay={0.15} className={cn("mt-8", align === "center" && "flex justify-center")}>
              {children}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
