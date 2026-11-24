"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  DURATION,
  EASE,
  VIEWPORT,
  staggerGroup,
  staggerItem,
  revealPop,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "scale" | "none";

function offset(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    case "scale":
      return { scale: 0.94 };
    default:
      return {};
  }
}

/**
 * Framer Motion reveal-on-scroll.
 * Animates once when ~25% of the element enters the viewport.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = DURATION.md,
  direction = "up",
  distance = 28,
  amount,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
  amount?: number;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, ...offset(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ ...VIEWPORT, amount: amount ?? VIEWPORT.amount }}
      transition={{ duration, delay, ease: EASE.out }}
    >
      {children}
    </MotionTag>
  );
}

/** Staggered group — children should use `<RevealItem>`. */
export function RevealGroup({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "ul" | "section";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  return (
    <MotionTag
      className={className}
      variants={staggerGroup(delay) as Variants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
  variant = "slide",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
  variant?: "slide" | "pop";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  return (
    <MotionTag
      className={className}
      variants={(variant === "pop" ? revealPop : staggerItem) as Variants}
    >
      {children}
    </MotionTag>
  );
}

/** Word-by-word headline entrance used in a few hero/secondary headers. */
export function RevealWords({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <motion.span
      className={cn("inline-block", className)}
      variants={staggerGroup(0.08) as Variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {text.split(" ").map((word, i) => (
        <motion.span key={`${word}-${i}`} className="inline-block">
          <motion.span className="inline-block" variants={staggerItem as Variants}>
            {word}
          </motion.span>
          {i < text.split(" ").length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
