import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Kids Island Senior Secondary School collects and uses information submitted through this website.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "Who we are",
    body: "This website is operated by Kids Island Senior Secondary School, Aligarh, Uttar Pradesh, India. You can reach us using the contact details published on our Contact page.",
  },
  {
    title: "Information we collect",
    body: "When you submit an admission enquiry or contact form, we collect the details you choose to provide: name, parent or guardian name, phone number, email address, class applying for, and your message. Server logs may also record your IP address for security and spam prevention.",
  },
  {
    title: "How we use it",
    body: "Enquiry details are used only to respond to your question, arrange a campus visit, and guide you through the admission process. We do not sell or rent your information. Messages are visible only to authorised school staff in the admin workspace.",
  },
  {
    title: "Cookies and sessions",
    body: "Public pages do not use advertising or tracking cookies. A single secure, HTTP-only session cookie is set only when a Master Admin signs in to the admin area.",
  },
  {
    title: "Storage and retention",
    body: "Submissions are stored in the school's secure database and retained for as long as needed to process the enquiry and meet record-keeping requirements. You may ask us to remove your enquiry by contacting the school.",
  },
  {
    title: "Third-party links",
    body: "Some pages link to external services such as Google Maps. Those services have their own privacy policies. The school is not responsible for their content or practices.",
  },
  {
    title: "Your choices",
    body: "You can ask to access, correct, or delete the information you submitted by contacting the school office. We may need to verify your identity before acting on a request.",
  },
  {
    title: "Changes to this policy",
    body: "We may update this policy as the website and school processes evolve. The latest version will always be published on this page.",
  },
];

export default async function PrivacyPage() {
  const site = await getSiteSettings();
  return (
    <>
      <PageHero
        tone="blue"
        breadcrumb="Privacy Policy"
        eyebrow="Legal"
        title="Privacy Policy"
        intro="Plain-language notes on what this website collects, why, and how the school looks after it."
      >
        <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[#8a5a00]">
          Starter policy · pending school review
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
                <section>
                  <h2 className="text-[20px] text-navy-900">Contact</h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    Questions about this policy can be sent to{" "}
                    <a href={`mailto:${site.email}`} className="font-bold text-blue">
                      {site.email}
                    </a>{" "}
                    or asked over the phone at{" "}
                    <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-bold text-blue">
                      {site.phone}
                    </a>
                    .
                  </p>
                </section>
              </div>
              <p className="mt-10 rounded-xl bg-paper-2 px-4 py-3 text-[11px] font-semibold leading-relaxed text-muted">
                This is a starter policy prepared for the website build. The school should review and adapt it to its
                actual data practices before launch.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
