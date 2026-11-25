"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonArrow } from "@/components/ui/button";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/content";

type NavLink = { label: string; href: string };

export function SiteHeader({
  site,
  links,
  cta,
}: {
  site: SiteSettings;
  links: NavLink[];
  cta: NavLink;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* slim top contact strip */}
      <div className="relative z-40 bg-navy-900 text-white/75">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 text-[11.5px] font-semibold sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <span className="hidden items-center gap-1.5 sm:flex">
              <Icon name="pin" className="h-3.5 w-3.5 text-yellow" />
              <span className="truncate">{site.location}</span>
            </span>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 transition-colors hover:text-white">
              <Icon name="phone" className="h-3.5 w-3.5 text-yellow" />
              <span>{site.phone}</span>
            </a>
            <a href={`mailto:${site.email}`} className="hidden items-center gap-1.5 transition-colors hover:text-white md:flex">
              <Icon name="mail" className="h-3.5 w-3.5 text-yellow" />
              <span>{site.email}</span>
            </a>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link href="/admin-login" className="flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors hover:bg-white/10 hover:text-white">
              <Icon name="lock" className="h-3 w-3" />
              Admin Login
            </Link>
            <span className="h-3 w-px bg-white/15" />
            <Link href="/staff-login" className="flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors hover:bg-white/10 hover:text-white">
              <Icon name="lock" className="h-3 w-3" />
              Staff Login
            </Link>
          </div>
        </div>
      </div>

      {/* main navbar */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-transparent bg-paper/92 backdrop-blur-xl transition-[box-shadow,border-color,padding] duration-300",
          scrolled && "border-line shadow-[0_10px_30px_-20px_rgba(18,50,92,0.35)]"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href="/" aria-label={`${site.name} — home`} className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Main navigation" className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative block rounded-xl px-2.5 py-2 text-[13px] font-extrabold tracking-tight transition-colors",
                        active ? "text-navy" : "text-navy/70 hover:text-navy"
                      )}
                    >
                      {link.label}
                      <span
                        className={cn(
                          "absolute inset-x-2.5 -bottom-0.5 h-[3px] origin-left rounded-full bg-yellow transition-transform duration-300",
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button href={cta.href} size="sm" className="group/btn hidden sm:inline-flex">
              {cta.label}
              <ButtonArrow />
            </Button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-navy/10 bg-white text-navy shadow-sm transition hover:bg-cream xl:hidden"
            >
              {open ? <Icon name="close" /> : <Icon name="menu" />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id="mobile-nav"
              key="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0.01 : DURATION.sm, ease: EASE.inOut }}
              className="overflow-hidden border-t border-line bg-paper xl:hidden"
            >
              <div className="max-h-[calc(100svh-118px)] overflow-y-auto px-5 pb-7 pt-4 sm:px-8">
                <motion.ul
                  className="grid gap-1"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
                  }}
                >
                  {links.map((link) => (
                    <motion.li
                      key={link.href}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0, transition: { duration: DURATION.sm, ease: EASE.out } },
                      }}
                    >
                      <Link
                        href={link.href}
                        aria-current={isActive(link.href) ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-4 py-3 text-[15px] font-extrabold transition-colors",
                          isActive(link.href)
                            ? "bg-navy text-white"
                            : "text-navy/80 hover:bg-navy/5"
                        )}
                      >
                        {link.label}
                        <Icon name="chevron-right" className="h-4 w-4 opacity-40" />
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>

                <div className="mt-4 grid gap-2.5 border-t border-line pt-4 sm:grid-cols-2">
                  <Button href={cta.href} full className="group/btn">
                    {cta.label}
                    <ButtonArrow />
                  </Button>
                  <Button href="/contact" variant="outline" full>
                    Contact the school
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-bold text-muted">
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5">
                    <Icon name="phone" className="h-3.5 w-3.5 text-yellow" /> {site.phone}
                  </a>
                  <a href={`mailto:${site.email}`} className="flex items-center gap-1.5">
                    <Icon name="mail" className="h-3.5 w-3.5 text-yellow" /> {site.email}
                  </a>
                  <Link href="/admin-login" className="flex items-center gap-1.5">
                    <Icon name="lock" className="h-3.5 w-3.5 text-white" /> Admin Login
                  </Link>
                  <Link href="/staff-login" className="flex items-center gap-1.5">
                    <Icon name="lock" className="h-3.5 w-3.5 text-white" /> Staff Login
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
