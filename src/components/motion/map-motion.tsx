"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { prefersReducedMotion } from "@/lib/motion";

const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3514.1234567890123!2d78.0745!3d27.8973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976d7d8f7c8d8d9%3A0x8f7c8d8f7c8d8f7c!2sKids%20Island%20Senior%20Secondary%20School%20Aligarh!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Kids Island Senior Secondary School Aligarh");

export function MapMotion({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        scrollTrigger: { trigger: card, start: "top 80%", once: true },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-cream shadow-soft">
        <div className="flex items-center justify-between border-b border-navy/5 px-5 py-3.5">
          <div className="flex items-center gap-2 text-[12px] font-extrabold text-navy">
            <Icon name="pin" className="h-4 w-4 text-blue" />
            Aligarh, Uttar Pradesh
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">
            Interactive Map
          </span>
        </div>

        <div className="relative h-[400px] w-full">
          <iframe
            title="Kids Island Senior Secondary School location on Google Maps"
            src={MAPS_EMBED_URL}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy/5 px-5 py-4">
          <p className="max-w-[16rem] text-[11px] font-semibold leading-snug text-muted">
            Campus location and nearby distances are pending confirmation by the school.
          </p>
          <Button href={MAPS_URL} variant="navy" size="sm" className="group/btn" target="_blank" rel="noopener noreferrer">
            Open in Google Maps
            <Icon name="arrow-up-right" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}