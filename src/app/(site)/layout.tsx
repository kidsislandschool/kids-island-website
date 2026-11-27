import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getFooter, getNav, getSiteSettings } from "@/lib/content";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/schemas";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings();
  const nav = await getNav();
  const footer = await getFooter();
  const baseUrl = "https://www.kidsaligarh.com";

  return (
    <>
      <OrganizationSchema
        name={site.name}
        url={baseUrl}
        logo={`${baseUrl}/logo.png`}
        address={
          site.location
            ? {
                streetAddress: site.location.split(",")[0]?.trim() || "",
                addressLocality: "Aligarh",
                addressRegion: "Uttar Pradesh",
                postalCode: "202001",
                addressCountry: "IN",
              }
            : {
                streetAddress: "",
                addressLocality: "Aligarh",
                addressRegion: "Uttar Pradesh",
                postalCode: "202001",
                addressCountry: "IN",
              }
        }
        phone={site.phone}
        email={site.email}
        hours={site.hoursOffice}
        socialMedia={site.socials.map((s) => s.url)}
      />
      <WebSiteSchema url={baseUrl} />
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
