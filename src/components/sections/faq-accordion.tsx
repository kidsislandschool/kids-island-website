"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { PublicFaq } from "@/lib/data";

export function FaqAccordion({ faqs }: { faqs: PublicFaq[] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(faqs[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-2.5">
      {faqs.map((faq) => {
        const isOpen = open === faq.id;
        return (
          <div
            key={faq.id}
            className={cn(
              "overflow-hidden rounded-2xl border bg-white transition-colors",
              isOpen ? "border-blue/30 shadow-soft" : "border-line"
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${faq.id}`}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[14.5px] font-extrabold text-navy-900">{faq.question}</span>
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors",
                  isOpen ? "bg-blue text-white" : "bg-paper-2 text-navy"
                )}
              >
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: DURATION.sm, ease: EASE.out }}>
                  <Icon name="plus" className="h-4 w-4" />
                </motion.span>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${faq.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0.01 : DURATION.sm, ease: EASE.inOut }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-muted">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
