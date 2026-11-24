"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Route-level enter transition. Kept to opacity only so it never creates a
 * containing block that would interfere with ScrollTrigger pinning.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.md, ease: EASE.out }}
    >
      {children}
    </motion.div>
  );
}
