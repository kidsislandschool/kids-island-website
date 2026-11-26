import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using the Kids Island Senior Secondary School website.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    title: "About this website",
    body: "This website provides general information about Kids Island Senior Secondary School, Aligarh. By using it, you agree to these terms.",
  },
  {
    title: "School information",
    body: "We work to keep information accurate and current, but details such as timings, fees, eligibility, facilities and dates may change. Please confirm anything important directly with the school office before making decisions.",
  },
  {
    title: "Admissions",
    body: "Submitting an inquiry or form does not constitute admission. Admissions remain subject to seat availability, document verification and the school's admission process.",
  },
  {
    title: "Acceptable use",
    body: "Do not attempt to gain unauthorised access to the admin area, upload malicious files, scrape the site aggressively, or use the contact forms to send spam, abusive content or misleading information.",
  },
  {
    title: "Intellectual property",
    body: "The school's name, logo, photographs and written content may not be copied or reused without permission. Illustrations and placeholders on this site are provided for the school's use.",
  },
  {
    title: "External links",
    body: "Links to third-party websites are provided for convenience. The school does not control those sites and is not responsible for their content or availability.",
  },
  {
    title: "Limitation",
    body: "The website is provided on an as-is basis. To the extent permitted by law, the school is not liable for losses arising from reliance on website content or from interruptions to the service.",
  },
  {
    title: "Contact",
    body: "For questions about these terms, please contact the school office using the details published on the Contact page.",
  },
];

export default function TermsPage() {
  const site = getSiteSettings();
  return (
    <>
      <PageHero
        tone="mint"
        breadcrumb="Terms of Use"
        eyebrow="Legal"
        title="Terms of Use"
        intro="The house rules for using the Kids Island website."
      >
        <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[#8a5a00]">
          Starter terms · pending school review
        </span>
      </PageHero>

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <div className="rounded-[2rem] border border-line bg-white p-7 shadow-soft sm:p-10">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                Last updated: {new Date().getFullYear()}
              </p>
              <div className="mt-8 space-y-8">
                {sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="text-[20px] text-navy-900">{section.title}</h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">{section.body}</p>
                  </section>
                ))}
              </div>
              <p className="mt-10 rounded-xl bg-paper-2 px-4 py-3 text-[11px] font-semibold leading-relaxed text-muted">
                This is a starter terms page prepared for the website build. The school should review it with its own
                advisers before launch. Questions: {site.email}.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
