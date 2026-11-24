import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getFooter, getNav, getSiteSettings } from "@/lib/content";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = getSiteSettings();
  const nav = getNav();
  const footer = getFooter();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-navy focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader site={site} links={nav.links} cta={nav.cta} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter site={site} footer={footer} socials={site.socials} />
    </>
  );
}
