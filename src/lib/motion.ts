/**
 * Shared motion tokens.
 *
 * Every animation on the site — Framer Motion reveals, GSAP ScrollTrigger
 * pinned sequences, crossfades, hero parallax and map motion — pulls its
 * durations and easing curves from here so the whole experience feels like
 * one system instead of a pile of unrelated transitions.
 */

export type Bezier = [number, number, number, number];

/** Shared duration scale (seconds). */
export const DURATION = {
  /** micro: hover states, focus rings, tiny shifts */
  xs: 0.18,
  /** fast: buttons, toggles, mobile menu items */
  sm: 0.28,
  /** base: reveals, card hovers, page fades */
  md: 0.45,
  /** slow: crossfade slideshows, hero imagery */
  lg: 0.7,
  /** deliberate: pinned sequence panel swaps, map draw-in */
  xl: 0.95,
  /** crossfade image swap */
  crossfade: 1.15,
} as const;

/** Shared easing curves. */
export const EASE: { out: Bezier; inOut: Bezier; soft: Bezier } = {
  /** Standard UI motion. */
  out: [0.22, 1, 0.36, 1],
  /** Gentle ease-in-out for crossfades. */
  inOut: [0.65, 0, 0.35, 1],
  /** Playful overshoot for badges/pills. */
  soft: [0.34, 1.2, 0.64, 1],
};

/** Stagger cadence used by reveal groups. */
export const STAGGER = {
  tight: 0.06,
  base: 0.1,
  loose: 0.16,
} as const;

/** Scroll offsets for `whileInView` triggers. */
export const VIEWPORT = {
  once: true,
  margin: "0px 0px -12% 0px",
  amount: 0.25,
} as const;

/** Canonical reveal variant (Framer Motion). */
export const revealUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.md, ease: EASE.out },
  },
};

/** Slightly larger reveal for hero / feature blocks. */
export const revealLarge = {
  hidden: { opacity: 0, y: 44 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.lg, ease: EASE.out },
  },
};

/** Scale-in reveal for badges, pills and illustrations. */
export const revealPop = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.md, ease: EASE.soft },
  },
};

/** Container helper for staggered children. */
export function staggerGroup(delay = 0) {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: STAGGER.base, delayChildren: delay },
    },
  };
}

/** Item variants for use inside `staggerGroup()`. */
export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.md, ease: EASE.out } },
};

/**
 * GSAP defaults so ScrollTrigger sequences feel identical to the Framer
 * reveals: same duration scale, same signature ease.
 */
export const GSAP_DEFAULTS = {
  duration: DURATION.md,
  ease: "power3.out",
} as const;

/** The matching GSAP ease for `EASE.out`. */
export const GSAP_EASE_OUT = "power3.out";
export const GSAP_EASE_IN_OUT = "power2.inOut";

/** Respect the user's reduced-motion preference. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
