"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/logo";
import { Icon, type IconName } from "@/components/ui/icon";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: IconName;
  badge?: number;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export function AdminShell({
  user,
  groups,
  children,
}: {
  user: { name: string; email: string };
  groups: AdminNavGroup[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeAdmins, setActiveAdmins] = useState<number>(0);
  const [activeAdminNames, setActiveAdminNames] = useState<string[]>([]);

  // Fetch active admin count
  useEffect(() => {
    const fetchActiveAdmins = async () => {
      try {
        const res = await fetch("/api/admin/active-admins", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.ok) {
            setActiveAdmins(data.activeCount);
            setActiveAdminNames(data.admins?.map((a: { name: string }) => a.name) ?? []);
          }
        }
      } catch {
        // Silently fail
      }
    };
    fetchActiveAdmins();
    const interval = setInterval(fetchActiveAdmins, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/staff-login";
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[70px] items-center justify-between border-b border-white/10 px-5">
        <Link href="/admin" aria-label="Kids Island admin dashboard" className="shrink-0">
          <Logo light compact />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="grid h-10 w-10 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden min-h-[44px] min-w-[44px]"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[9.5px] font-extrabold uppercase tracking-[0.18em] text-white/30">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center justify-between gap-2 rounded-lg px-3 py-3 text-[12.5px] font-bold transition-colors min-h-[48px]",
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/55 hover:bg-white/5 hover:text-white/90"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          name={item.icon}
                          className={cn("h-4 w-4", active ? "text-yellow" : "text-white/35 group-hover:text-white/60")}
                        />
                        {item.label}
                      </span>
                      {typeof item.badge === "number" && item.badge > 0 && (
                        <span
                          className={cn(
                            "min-w-5 rounded-full px-1.5 py-0.5 text-center text-[9.5px] font-extrabold",
                            active ? "bg-yellow text-navy-900" : "bg-white/10 text-white/70"
                          )}
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-[11.5px] font-bold text-white/45 transition hover:bg-white/5 hover:text-white min-h-[48px] min-w-[48px]"
        >
          <Icon name="arrow-up-right" className="h-4 w-4 text-white/30" />
          View public website
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-paper-2">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] bg-navy-900 lg:block">{sidebar}</aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.sm }}
              className="fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: reduce ? 0.01 : DURATION.sm, ease: EASE.out }}
              className="fixed inset-y-0 left-0 z-50 w-[272px] bg-navy-900 lg:hidden"
              aria-label="Admin menu"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-[248px]">
        {/* top bar */}
        <header className="sticky top-0 z-30 flex h-[64px] items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            className="grid h-12 w-12 place-items-center rounded-xl border border-line bg-white text-navy shadow-sm transition hover:bg-cream lg:hidden min-h-[48px] min-w-[48px]"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-[12px] font-extrabold text-navy-900">
              Kids Island <span className="font-semibold text-muted">· Master Admin</span>
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Active Admins Indicator */}
            {activeAdmins > 0 && (
              <div className="hidden items-center gap-1.5 rounded-full border border-green-accent/30 bg-green-accent/10 px-3 py-1.5 sm:flex" title={`Active admins: ${activeAdminNames.join(", ")}`}>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-green-accent text-white text-[9px] font-extrabold">
                  {activeAdmins}
                </span>
                <span className="text-[10.5px] font-extrabold text-green-accent">
                  {activeAdmins} active
                </span>
              </div>
            )}
            <div className="hidden items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-3 sm:flex">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-navy text-[10.5px] font-extrabold text-white">
                {user.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")}
              </span>
              <span className="leading-none">
                <span className="block max-w-[150px] truncate text-[11.5px] font-extrabold text-navy-900">
                  {user.name}
                </span>
                <span className="mt-0.5 block max-w-[150px] truncate text-[9.5px] font-bold text-muted">
                  {user.email}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-[11.5px] font-extrabold text-navy transition hover:border-[#F3C6D1] hover:bg-[#FFF1F4] hover:text-[#A32D4B] disabled:opacity-60"
            >
              <Icon name="logout" className="h-4 w-4" />
              <span className="hidden sm:inline">{loggingOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
