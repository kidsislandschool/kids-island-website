import type { Metadata } from "next";
import Link from "next/link";
import { getContent, getSiteSettings } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedFaqs } from "@/lib/data";
import { PageHero } from "@/components/sections/page-hero";
import { MapMotion } from "@/components/motion/map-motion";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildPageMetadata("/contact", {
    title: "Contact Us",
    description: "Get in touch with Kids Island Senior Secondary School, Aligarh.",
  });
}

type ContactPage = {
  heading: string;
  intro: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  hoursPhone: string;
  hoursOffice: string;
  visitHeading: string;
  visitText: string;
};

type Direction = { title: string; text: string };

export default function ContactPage() {
  const site = getSiteSettings();
  const content = getContent<ContactPage>("contact.page", {
    heading: "Get in touch with us",
    intro: "We're here to answer your questions and help you learn more about our school.",
    address: site.location,
    phone: site.phone,
    email: site.email,
    whatsapp: site.whatsapp,
    hoursPhone: site.hoursPhone,
    hoursOffice: site.hoursOffice,
    visitHeading: "Visit our campus",
    visitText: "Centrally located in Aligarh and accessible from major areas of the city.",
  });
  const directions = getContent<Direction[]>("contact.directions", []);
  const faqs = getPublishedFaqs();
  const waNumber = (content.whatsapp || site.whatsapp).replace(/\D/g, "");

  const cards = [
    {
      label: "Visit us",
      value: content.address,
      icon: "pin" as const,
      tone: "bg-blue-100 text-blue",
      href: undefined,
    },
    {
      label: "Call the office",
      value: content.phone,
      sub: content.hoursPhone,
      icon: "phone" as const,
      tone: "bg-mint text-[#167a4a]",
      href: `tel:${content.phone.replace(/\s/g, "")}`,
    },
    {
      label: "Email us",
      value: content.email,
      sub: "We reply on working days.",
      icon: "mail" as const,
      tone: "bg-blush text-[#b23a6b]",
      href: `mailto:${content.email}`,
    },
    {
      label: "WhatsApp",
      value: content.whatsapp,
      sub: "Quick questions and support.",
      icon: "whatsapp" as const,
      tone: "bg-yellow-100 text-[#8a5a00]",
      href: waNumber ? `https://wa.me/${waNumber}` : undefined,
    },
  ];

  return (
    <>
      <PageHero
        tone="cream"
        breadcrumb="Contact"
        eyebrow="Contact us"
        title={<>We're here to <span className="wave-underline">help</span></>}
        intro={content.intro}
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#visit" variant="navy">
            <Icon name="pin" className="h-4 w-4" />
            Plan a campus visit
          </Button>
          <Button href="#contact-form" variant="outline">
            Send a message
          </Button>
        </div>
      </PageHero>

      <section className="relative bg-paper py-14 sm:py-16" aria-label="Contact details">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, i) => {
              const inner = (
                <>
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl ${card.tone}`}>
                    <Icon name={card.icon} className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-muted">{card.label}</p>
                  <p className="mt-1.5 text-[14px] font-extrabold leading-snug text-navy-900">{card.value}</p>
                  {card.sub && <p className="mt-1 text-[11px] font-semibold leading-snug text-muted">{card.sub}</p>}
                  {card.href && (
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-blue">
                      Open <Icon name="arrow-up-right" className="h-3 w-3" />
                    </span>
                  )}
                </>
              );
              return (
                <Reveal key={card.label} delay={i * 0.04}>
                  {card.href ? (
                    <a
                      href={card.href}
                      target={card.href.startsWith("http") ? "_blank" : undefined}
                      rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex h-full flex-col rounded-[1.5rem] border border-line bg-white p-5 shadow-[0_14px_36px_-32px_rgba(18,50,92,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-blue/25 hover:shadow-soft"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="flex h-full flex-col rounded-[1.5rem] border border-line bg-white p-5 shadow-[0_14px_36px_-32px_rgba(18,50,92,0.45)]">
                      {inner}
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <Reveal direction="left">
              <div id="contact-form" className="scroll-mt-24 rounded-[2rem] border border-line bg-white p-6 shadow-soft sm:p-8">
                <SectionHeading
                  align="left"
                  eyebrow="Write to us"
                  eyebrowTone="yellow"
                  title="Send a message to the school office"
                  className="[&_h2]:text-[clamp(1.5rem,2.6vw,1.9rem)]"
                />
                <div className="mt-6">
                  <InquiryForm type="contact" />
                </div>
              </div>
            </Reveal>

            <div className="flex flex-col gap-4">
              <Reveal direction="right">
                <div className="rounded-[1.75rem] bg-navy p-7 text-white">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-yellow">
                      <Icon name="clock" className="h-5 w-5" />
                    </span>
                    <h2 className="text-lg text-white">Office hours</h2>
                  </div>
                  <dl className="mt-5 space-y-3 text-[12.5px]">
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                      <dt className="font-extrabold text-white/85">Phone</dt>
                      <dd className="text-right font-semibold text-white/55">{content.hoursPhone}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="font-extrabold text-white/85">School office</dt>
                      <dd className="text-right font-semibold text-white/55">{content.hoursOffice}</dd>
                    </div>
                  </dl>
                  <p className="mt-5 rounded-xl bg-white/5 px-3.5 py-2.5 text-[11px] font-semibold leading-relaxed text-white/45">
                    Timings are as published by the school. Please call ahead on holidays.
                  </p>
                </div>
              </Reveal>

              <Reveal direction="right" delay={0.06}>
                <div className="rounded-[1.75rem] border border-line bg-cream p-6">
                  <h2 className="text-lg text-navy-900">Looking for something else?</h2>
                  <ul className="mt-4 space-y-2">
                    {[
                      { label: "Admission enquiry", href: "/admissions#inquiry" },
                      { label: "Study materials", href: "/study-materials" },
                      { label: "Notices & events", href: "/notices" },
                      { label: "Faculty", href: "/faculty" },
                    ].map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center justify-between rounded-xl bg-white/70 px-3.5 py-2.5 text-[12.5px] font-extrabold text-navy/75 transition hover:bg-white hover:text-navy"
                        >
                          {link.label}
                          <Icon name="chevron-right" className="h-3.5 w-3.5 opacity-40" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* visit / map */}
      <section id="visit" className="relative scroll-mt-24 overflow-hidden bg-cream py-16 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid text-navy/[0.035]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <Reveal direction="left">
              <MapMotion />
            </Reveal>
            <Reveal direction="right" delay={0.08}>
              <SectionHeading
                align="left"
                eyebrow="Campus visit"
                eyebrowTone="blue"
                title={content.visitHeading}
                text={content.visitText}
                className="[&_h2]:max-w-md"
              />
              {directions.length > 0 && (
                <ul className="mt-6 space-y-2.5">
                  {directions.map((direction) => (
                    <li key={direction.title} className="flex items-start gap-3 rounded-xl border border-white bg-white/70 px-4 py-3">
                      <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
                      <div>
                        <p className="text-[12.5px] font-extrabold text-navy-900">{direction.title}</p>
                        <p className="text-[11.5px] font-semibold text-muted">{direction.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Kids Island Senior Secondary School Aligarh")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="navy"
                >
                  <Icon name="pin" className="h-4 w-4" />
                  Get directions
                </Button>
                <Button href={`tel:${content.phone.replace(/\s/g, "")}`} variant="outline">
                  <Icon name="phone" className="h-4 w-4" />
                  Call before visiting
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* faq */}
      {faqs.length > 0 && (
        <section id="faq" className="scroll-mt-24 bg-paper py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <Reveal>
              <SectionHeading
                eyebrow="FAQs"
                eyebrowTone="mint"
                title="Questions parents ask us"
                text="Can't find your answer? Call the office or send us a message — we're happy to help."
              />
            </Reveal>
            <Reveal className="mt-10" delay={0.05}>
              <FaqAccordion faqs={faqs} />
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
