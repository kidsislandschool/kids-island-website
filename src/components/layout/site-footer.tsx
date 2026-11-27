import Link from "next/link";
import { Logo } from "./logo";
import { CloudDivider } from "@/components/ui/clouds";
import { Icon } from "@/components/ui/icon";
import { getFooter, getSiteSettings, type SiteSettings } from "@/lib/content";

type FooterData = ReturnType<typeof getFooter>;

export function SiteFooter({
  site,
  footer,
  socials,
}: {
  site: SiteSettings;
  footer: FooterData;
  socials: SiteSettings["socials"];
}) {
  return (
    <div className="bg-paper">
      <CloudDivider fill="#0d2e1e" />
      <footer className="relative overflow-hidden bg-green-900 text-white/70">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-green-accent/25 blur-[90px]" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-yellow/10 blur-[90px]" />
          <svg viewBox="0 0 220 120" className="absolute right-[8%] top-10 w-32 opacity-[0.05]" fill="#fff">
            <path d="M42 104c-20 0-34-13-34-30 0-15 11-26 25-29 3-22 20-37 43-37 19 0 34 10 41 26 6-4 13-6 21-6 19 0 34 13 37 31 16 2 28 13 28 28 0 16-13 27-31 27H42Z" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 sm:pt-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.1fr]">
            <div>
              <Link href="/" aria-label={`${site.name} — home`}>
                <Logo light />
              </Link>
              <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-white/60">{footer.blurb}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-green-accent/40 hover:bg-green-accent hover:text-white"
                  >
                    <Icon
                      name={
                        social.label.toLowerCase().includes("face")
                          ? "facebook"
                          : social.label.toLowerCase().includes("insta")
                          ? "instagram"
                          : social.label.toLowerCase().includes("you")
                          ? "youtube"
                          : social.label.toLowerCase().includes("whats")
                          ? "whatsapp"
                          : "link"
                      }
                      className="h-5 w-5"
                    />
                  </a>
                ))}
                <a
                  href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-green-accent/40 hover:bg-green-accent hover:text-white"
                >
                  <Icon name="whatsapp" className="h-5 w-5" />
                </a>
                <a
                  href={`mailto:${site.email}`}
                  aria-label="Email the school"
                  className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-green-accent/40 hover:bg-green-accent hover:text-white"
                >
                  <Icon name="mail" className="h-5 w-5" />
                </a>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  aria-label="Call the school"
                  className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-green-accent/40 hover:bg-green-accent hover:text-white"
                >
                  <Icon name="phone" className="h-5 w-5" />
                </a>
              </div>
            </div>

            <nav aria-label="Footer quick links">
              <h3 className="font-display text-[15px] font-semibold uppercase tracking-[0.14em] text-white">Quick links</h3>
              <ul className="mt-5 space-y-2.5">
                {footer.quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group inline-flex items-center gap-2 min-h-[44px] px-3 py-2 text-[13.5px] font-semibold transition-colors text-white hover:text-green-accent rounded-xl">
                      <span className="h-1 w-1 rounded-full bg-green-accent transition-transform group-hover:scale-150" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Footer resources">
              <h3 className="font-display text-[15px] font-semibold uppercase tracking-[0.14em] text-white">Resources</h3>
              <ul className="mt-5 space-y-2.5">
                {footer.resources.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group inline-flex items-center gap-2 min-h-[44px] px-3 py-2 text-[13.5px] font-semibold transition-colors text-white hover:text-green-accent rounded-xl">
                      <span className="h-1 w-1 rounded-full bg-green-accent transition-transform group-hover:scale-150" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h3 className="font-display text-[15px] font-semibold uppercase tracking-[0.14em] text-white">Reach us</h3>
              <ul className="mt-5 space-y-3 text-[13.5px] font-semibold text-white">
                <li className="flex gap-2.5 min-h-[44px] px-3 py-2 rounded-xl transition-colors hover:bg-white/5">
                  <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-yellow" />
                  <span>{site.location}</span>
                </li>
                <li className="flex gap-2.5 min-h-[44px] px-3 py-2 rounded-xl transition-colors hover:bg-white/5">
                  <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-yellow" />
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-white">
                    {site.phone}
                  </a>
                </li>
                <li className="flex gap-2.5 min-h-[44px] px-3 py-2 rounded-xl transition-colors hover:bg-white/5">
                  <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-green-accent" />
                  <a href={`mailto:${site.email}`} className="break-all transition-colors text-white hover:text-green-accent">
                    {site.email}
                  </a>
                </li>
                <li className="flex gap-2.5 min-h-[44px] px-3 py-2 rounded-xl transition-colors hover:bg-white/5">
                  <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-yellow" />
                  <span>{site.hoursOffice}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[12px] font-semibold text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center sm:text-left">© {new Date().getFullYear()} {footer.copyright}</p>
            <p className="text-center text-white/30 sm:text-left">
              Designed & developed by{" "}
              <a
                href="https://armaan-portfolio-seven.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-accent transition-colors"
              >
                Armaan Adeel
              </a>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end sm:gap-6">
              {footer.legal.map((link) => (
                <Link key={link.href} href={link.href} className="min-h-[44px] px-3 py-2 transition-colors text-white hover:text-green-accent rounded-xl">
                  {link.label}
                </Link>
              ))}
              <Link href="/staff-login" className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 transition-colors text-white hover:text-green-accent rounded-xl">
                <Icon name="lock" className="h-4 w-4" /> Staff
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
