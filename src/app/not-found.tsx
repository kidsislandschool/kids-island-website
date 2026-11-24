import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { Cloud, Sparkle } from "@/components/ui/clouds";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#FFF7E8,#FFFDF9)] px-5 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="dot-grid absolute inset-0 text-navy/[0.05]" />
        <Cloud className="absolute left-[8%] top-20 w-32 opacity-80" fill="#fff" />
        <Cloud className="absolute right-[10%] top-32 w-24 opacity-60" fill="#fff" />
        <Cloud className="absolute bottom-16 left-[30%] w-40 opacity-50" fill="#fff" />
        <Sparkle className="absolute right-[30%] top-16 h-5 w-5 opacity-70" />
      </div>

      <div className="relative">
        <Link href="/" aria-label="Kids Island home">
          <Logo />
        </Link>
        <p className="mt-10 font-display text-[clamp(4.5rem,14vw,8rem)] font-semibold leading-none tracking-tight text-navy-900">
          4<span className="text-yellow">0</span>4
        </p>
        <h1 className="mt-4 text-2xl text-navy-900">This page has wandered off the island.</h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          The page you were looking for doesn&apos;t exist or has moved. Let&apos;s get you back to somewhere useful.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href="/">Back to homepage</Button>
          <Button href="/contact" variant="outline">
            Contact the school
          </Button>
        </div>
      </div>
    </main>
  );
}
