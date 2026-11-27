"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./logo";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonArrow } from "@/components/ui/button";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/content";

type NavLink = { label: string; href: string };

// Number of visible nav items on mobile before showing "More" dropdown
const MOBILE_VISIBLE_ITEMS = 5;

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
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <div className="relative z-40 bg-green-900 text-white/75">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 text-[12px] font-semibold sm:px-6 sm:py-2 sm:text-[12px] lg:px-8">
          <div className="flex min-w-0 flex-wrap items-center gap-3 lg:gap-4">
            <span className="hidden items-center gap-1.5 sm:flex">
              <Icon name="pin" className="h-4 w-4 text-yellow" />
              <span className="truncate">{site.location}</span>
            </span>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl transition-colors hover:text-white hover:bg-white/5">
              <Icon name="phone" className="h-4 w-4 text-yellow" />
              <span>{site.phone}</span>
            </a>
            <a href={`mailto:${site.email}`} className="hidden items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl transition-colors hover:text-white hover:bg-white/5 md:flex">
              <Icon name="mail" className="h-4 w-4 text-yellow" />
              <span>{site.email}</span>
            </a>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 lg:gap-2">
            <Link href="/admin-login" className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl transition-colors hover:bg-white/10 hover:text-white">
              <Icon name="lock" className="h-4 w-4" />
              Admin Login
            </Link>
            <span className="h-4 w-px bg-white/15" />
            <Link href="/staff-login" className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl transition-colors hover:bg-white/10 hover:text-white">
              <Icon name="lock" className="h-4 w-4" />
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
              className="flex h-12 w-12 place-items-center rounded-2xl border border-navy/10 bg-white text-navy shadow-sm transition hover:bg-cream xl:hidden min-h-[48px] min-w-[48px]"
            >
              {open ? <Icon name="close" className="h-6 w-6" /> : <Icon name="menu" className="h-6 w-6" />}
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
                  {links.slice(0, MOBILE_VISIBLE_ITEMS).map((link) => (
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
                          "flex items-center justify-between rounded-2xl px-5 py-4 text-[16px] font-extrabold transition-colors min-h-[56px]",
                          isActive(link.href)
                            ? "bg-navy text-white"
                            : "text-navy/80 hover:bg-navy/5"
                        )}
                      >
                        {link.label}
                        <Icon name="chevron-right" className="h-5 w-5 opacity-40" />
                      </Link>
                    </motion.li>
                  ))}
                  {links.length > MOBILE_VISIBLE_ITEMS && (
                    <motion.li
                      key="more-dropdown"
                      ref={moreRef}
                      variants={{
                        hidden: { opacity: 0, y: -10 },
                        visible: { opacity: 1, y: 0, transition: { duration: DURATION.sm, ease: EASE.out } },
                      }}
                    >
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMoreOpen((v) => !v)}
                          aria-expanded={moreOpen}
                          aria-label={moreOpen ? "Close more options" : "More options"}
                          className={cn(
                            "flex items-center justify-between rounded-2xl px-5 py-4 text-[16px] font-extrabold transition-colors min-h-[56px]",
                            moreOpen ? "bg-navy text-white" : "text-navy/80 hover:bg-navy/5"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <Icon name="more-horizontal" className="h-5 w-5" />
                            More
                          </span>
                          <Icon name={moreOpen ? "chevron-up" : "chevron-down"} className="h-5 w-5 opacity-40 transition-transform" />
                        </button>
                        {moreOpen && (
                          <AnimatePresence initial={false}>
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: reduce ? 0.01 : DURATION.sm, ease: EASE.out }}
                              className="absolute right-0 top-full mt-1 z-20 min-w-[180px] rounded-2xl border border-line bg-white shadow-[0_20px_40px_-20px_rgba(18,50,92,0.4)] overflow-hidden"
                            >
                              <motion.ul
                                className="py-1"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                  hidden: {},
                                  visible: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
                                }}
                              >
                                {links.slice(MOBILE_VISIBLE_ITEMS).map((link) => (
                                  <motion.li
                                    key={link.href}
                                    variants={{
                                      hidden: { opacity: 0, x: -8 },
                                      visible: { opacity: 1, x: 0, transition: { duration: DURATION.sm, ease: EASE.out } },
                                    }}
                                  >
                                    <Link
                                      href={link.href}
                                      aria-current={isActive(link.href) ? "page" : undefined}
                                      onClick={() => setMoreOpen(false)}
                                      className={cn(
                                        "flex items-center justify-between rounded-xl px-5 py-4 text-[15px] font-extrabold transition-colors min-h-[56px]",
                                        isActive(link.href)
                                          ? "bg-navy/10 text-navy"
                                          : "text-navy/80 hover:bg-navy/5"
                                      )}
                                    >
                                      {link.label}
                                      <Icon name="chevron-right" className="h-5 w-5 opacity-40" />
                                    </Link>
                                  </motion.li>
                                ))}
                              </motion.ul>
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </div>
                    </motion.li>
                  )}
                </motion.ul>

                <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                  <Button href={cta.href} full size="lg" className="group/btn">
                    {cta.label}
                    <ButtonArrow />
                  </Button>
                  <Button href="/contact" variant="outline" full size="lg">
                    Contact the school
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-[13px] font-bold text-muted">
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl bg-paper-2 transition-colors hover:bg-navy/5">
                    <Icon name="phone" className="h-4 w-4 text-yellow" /> {site.phone}
                  </a>
                  <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl bg-paper-2 transition-colors hover:bg-navy/5">
                    <Icon name="mail" className="h-4 w-4 text-yellow" /> {site.email}
                  </a>
                  <Link href="/admin-login" className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl bg-paper-2 transition-colors hover:bg-navy/5">
                    <Icon name="lock" className="h-4 w-4 text-white" /> Admin Login
                  </Link>
                  <Link href="/staff-login" className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl bg-paper-2 transition-colors hover:bg-navy/5">
                    <Icon name="lock" className="h-4 w-4 text-white" /> Staff Login
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
