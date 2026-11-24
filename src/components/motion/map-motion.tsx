"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { prefersReducedMotion } from "@/lib/motion";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Kids Island Senior Secondary School Aligarh");

/**
 * Animated contact map.
 *
 * A clearly-labelled illustrative map of Aligarh (not a fabricated exact
 * location): roads draw themselves in, the campus pin drops and labels fade
 * in as the card scrolls into view. A real Google Maps link is provided for
 * actual directions.
 */
export function MapMotion({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const roads = gsap.utils.toArray<SVGPathElement>(".map-road", card);
      roads.forEach((road) => {
        const len = road.getTotalLength();
        gsap.set(road, { strokeDasharray: len, strokeDashoffset: len });
      });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: card, start: "top 78%", once: true },
        defaults: { ease: "power2.out" },
      });
      tl.to(roads, { strokeDashoffset: 0, duration: 1, stagger: 0.09, ease: "power3.inOut" }, 0)
        .from(".map-block", { opacity: 0, scale: 0.9, stagger: 0.04, duration: 0.5, transformOrigin: "center" }, 0.15)
        .from(".map-park", { opacity: 0, scale: 0.85, duration: 0.6 }, 0.35)
        .from(".map-label", { opacity: 0, y: 10, stagger: 0.12, duration: 0.45 }, 0.55)
        .from(".map-route", { opacity: 0, duration: 0.6 }, 0.45)
        .from(".map-pin-group", { y: -90, opacity: 0, duration: 0.85, ease: "back.out(1.7)" }, 0.55)
        .from(".map-compass", { rotate: -90, opacity: 0, duration: 0.6, ease: "back.out(1.4)" }, 0.7);

      // gentle idle float on the pin
      gsap.to(".map-pin-float", {
        y: -4,
        duration: 1.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
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
            Illustrative map
          </span>
        </div>

        <svg
          viewBox="0 0 640 430"
          className="block h-auto w-full"
          role="img"
          aria-label="Illustrative map showing Kids Island Senior Secondary School in Aligarh with nearby landmarks"
        >
          <rect width="640" height="430" fill="#FFF8E9" />
          {/* city blocks */}
          <g opacity=".85">
            <rect className="map-block" x="36" y="40" width="92" height="70" rx="10" fill="#FCEBC9" />
            <rect className="map-block" x="150" y="30" width="70" height="60" rx="10" fill="#F7E3D0" />
            <rect className="map-block" x="470" y="42" width="120" height="74" rx="10" fill="#FCEBC9" />
            <rect className="map-block" x="60" y="300" width="110" height="76" rx="10" fill="#F7E3D0" />
            <rect className="map-block" x="480" y="290" width="96" height="82" rx="10" fill="#FCEBC9" />
            <rect className="map-block" x="240" y="300" width="120" height="70" rx="10" fill="#F4E6D2" />
          </g>

          {/* park */}
          <g className="map-park">
            <path d="M236 60c52-22 116-6 128 36 10 36-14 66-60 70-50 4-90-10-96-48-4-26 10-48 28-58Z" fill="#CDEFCB" />
            <path d="M264 108c10-22 30-22 40 0 10-22 30-22 40 0 0 24-40 42-40 42s-40-18-40-42Z" fill="#7ED9A3" opacity=".7" />
            <text className="map-label" x="300" y="88" textAnchor="middle" fontSize="11" fontWeight="800" fill="#2C7A4B" letterSpacing="1">CITY GREENS</text>
          </g>

          {/* railway */}
          <g>
            <path className="map-road" d="M0 214C120 206 210 230 320 214 430 198 540 222 640 210" fill="none" stroke="#D9CDB8" strokeWidth="12" />
            <path d="M0 214C120 206 210 230 320 214 430 198 540 222 640 210" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="14 12" />
            <text className="map-label" x="36" y="204" fontSize="10" fontWeight="800" fill="#9A8768" letterSpacing="1.4">RAILWAY LINE</text>
          </g>

          {/* roads */}
          <g>
            <path className="map-road" d="M150 0c8 90-18 160 6 236 16 52 2 122-14 194" fill="none" stroke="#EFE2CA" strokeWidth="20" strokeLinecap="round" />
            <path className="map-road" d="M470 0c-10 80 14 150-6 226-12 46 4 130 22 204" fill="none" stroke="#EFE2CA" strokeWidth="20" strokeLinecap="round" />
            <path className="map-road" d="M0 340c110-28 210 14 320-8 120-22 210 8 320-18" fill="none" stroke="#EFE2CA" strokeWidth="18" strokeLinecap="round" />
            <path className="map-road" d="M0 120c90 18 160-8 240 4 90 14 180-2 280 12" fill="none" stroke="#F3E8D4" strokeWidth="14" strokeLinecap="round" />
            <path d="M0 340c110-28 210 14 320-8 120-22 210 8 320-18" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10 14" opacity=".7" />
          </g>

          {/* route to school */}
          <path
            className="map-route"
            d="M196 288c30-22 48-34 66-52 20-20 26-34 46-36"
            fill="none"
            stroke="#2F6FED"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="7 8"
          />

          {/* landmarks */}
          <g className="map-label">
            <circle cx="196" cy="292" r="7" fill="#2F6FED" stroke="#fff" strokeWidth="3" />
            <g transform="translate(118 316)">
              <rect x="0" y="-12" width="168" height="28" rx="14" fill="#fff" />
              <text x="10" y="7" fontSize="10.5" fontWeight="800" fill="#12325C">Aligarh Railway Station</text>
            </g>
          </g>
          <text className="map-label" x="196" y="346" fontSize="9" fontWeight="700" fill="#8A7A60">≈ 2.3 km (to confirm)</text>

          <g className="map-label">
            <circle cx="470" cy="300" r="7" fill="#FF9F1C" stroke="#fff" strokeWidth="3" />
            <g transform="translate(478 314)">
              <rect x="0" y="-12" width="126" height="28" rx="14" fill="#fff" />
              <text x="10" y="7" fontSize="10.5" fontWeight="800" fill="#12325C">Civil Lines Bus Stand</text>
            </g>
          </g>

          <g className="map-label">
            <circle cx="508" cy="140" r="7" fill="#167A4A" stroke="#fff" strokeWidth="3" />
            <g transform="translate(352 150)">
              <rect x="0" y="-12" width="144" height="28" rx="14" fill="#fff" />
              <text x="10" y="7" fontSize="10.5" fontWeight="800" fill="#12325C">Aligarh Muslim University</text>
            </g>
          </g>

          {/* campus pin */}
          <g className="map-pin-group" transform="translate(318 238)">
            <g className="map-pin-float">
              <circle r="46" fill="#FFC53D" opacity=".18" />
              <circle r="32" fill="#FFC53D" opacity=".22" />
              <path
                d="M0-34c-17 0-30 13-30 30 0 22 30 52 30 52s30-30 30-52c0-17-13-30-30-30Z"
                fill="#E85D75"
                stroke="#fff"
                strokeWidth="4"
              />
              <circle cy="-4" r="12" fill="#fff" />
              <path d="M-5-5l4 4 7-8" stroke="#E85D75" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
            <g transform="translate(-58 62)">
              <rect x="0" y="0" width="116" height="34" rx="17" fill="#12325C" />
              <text x="58" y="21" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" letterSpacing=".4">KIDS ISLAND</text>
            </g>
          </g>

          {/* compass */}
          <g className="map-compass" transform="translate(590 372)">
            <circle r="24" fill="#fff" stroke="#E7EEF8" />
            <path d="M0-12 7 8 0 4-7 8Z" fill="#2F6FED" />
            <text y="18" textAnchor="middle" fontSize="8" fontWeight="800" fill="#5B6B85">N</text>
          </g>
        </svg>

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
