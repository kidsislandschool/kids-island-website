"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Floating WhatsApp button with click-to-expand animation. */
export function WhatsAppFloat({
  phone = "+91 9997973574",
  message = "Hello, I'd like to know more about Kids Island Senior Secondary School.",
}: {
  phone?: string;
  message?: string;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const cleanPhone = phone.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      // Hide when near footer
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(y < docHeight - 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && !e.composedPath().includes(document.getElementById("wa-float"))) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div id="wa-float" className={cn("fixed bottom-5 right-5 z-[60] transition-opacity duration-300", !visible && "opacity-0 pointer-events-none")}>
      {/* Floating action button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 right-5 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] shadow-[0_8px_24px_-8px_rgba(37,211,102,0.5)] transition-transform duration-300 hover:scale-105",
          open && "rotate-45 bg-[#128C7E]"
        )}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        aria-expanded={open}
      >
        <Icon name={open ? "close" : "whatsapp"} className="h-7 w-7 text-white" strokeWidth={2} />
      </button>

      {/* Expanded chat preview */}
      <div
        className={cn(
          "absolute bottom-16 right-0 transform transition-all duration-300 ease-out",
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        )}
        role="dialog"
        aria-label="WhatsApp chat"
      >
        <div className="rounded-2xl border border-line bg-white shadow-[0_16px_40px_-24px_rgba(18,50,92,0.4)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 rounded-t-2xl bg-[#25D366] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20">
                <Icon name="whatsapp" className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="font-extrabold text-white">Kids Island School</p>
                <p className="text-[11px] font-semibold text-white/80">Typically replies within minutes</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[13px] leading-relaxed text-navy/70">
              Hello! How can we help you today? Ask about admissions, academics, campus visits or anything else.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-[#25D366] px-4 py-3 text-center text-[13.5px] font-extrabold text-white transition-colors hover:bg-[#128C7E]"
            >
              <Icon name="whatsapp" className="inline h-4 w-4 mr-2" />
              Start chatting on WhatsApp
            </a>
            <p className="text-[10.5px] text-center text-muted">
              Opens in WhatsApp Web / App
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppFloat({
  phone = "+91 9997973574",
  message = "Hello, I'd like to know more about Kids Island Senior Secondary School.",
}: {
  phone?: string;
  message?: string;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const cleanPhone = phone.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      // Hide when near footer
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(y < docHeight - 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && !e.composedPath().includes(document.getElementById("wa-float"))) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div id="wa-float" className={cn("fixed bottom-5 right-5 z-[60] transition-opacity duration-300", !visible && "opacity-0 pointer-events-none")}>
      {/* Floating action button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 right-5 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] shadow-[0_8px_24px_-8px_rgba(37,211,102,0.5)] transition-transform duration-300 hover:scale-105",
          open && "rotate-45 bg-[#128C7E]"
        )}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        aria-expanded={open}
      >
        <Icon name={open ? "close" : "whatsapp"} className="h-7 w-7 text-white" strokeWidth={2} />
      </button>

      {/* Expanded chat preview */}
      <div
        className={cn(
          "absolute bottom-16 right-0 transform transition-all duration-300 ease-out",
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        )}
        role="dialog"
        aria-label="WhatsApp chat"
      >
        <div className="rounded-2xl border border-line bg-white shadow-[0_16px_40px_-24px_rgba(18,50,92,0.4)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 rounded-t-2xl bg-[#25D366] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20">
                <Icon name="whatsapp" className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="font-extrabold text-white">Kids Island School</p>
                <p className="text-[11px] font-semibold text-white/80">Typically replies within minutes</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[13px] leading-relaxed text-navy/70">
              Hello! How can we help you today? Ask about admissions, academics, campus visits or anything else.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-[#25D366] px-4 py-3 text-center text-[13.5px] font-extrabold text-white transition-colors hover:bg-[#128C7E]"
            >
              <Icon name="whatsapp" className="inline h-4 w-4 mr-2" />
              Start chatting on WhatsApp
            </a>
            <p className="text-[10.5px] text-center text-muted">
              Opens in WhatsApp Web / App
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}