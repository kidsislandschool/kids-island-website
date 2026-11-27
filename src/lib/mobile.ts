"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if the user is on a mobile device
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to detect if the user is on a tablet device
 */
export function useIsTablet(breakpointMin = 768, breakpointMax = 1024): boolean {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= breakpointMin && width < breakpointMax);
    };
    checkTablet();
    window.addEventListener("resize", checkTablet);
    return () => window.removeEventListener("resize", checkTablet);
  }, [breakpointMin, breakpointMax]);

  return isTablet;
}

/**
 * Hook to detect if the user is on a desktop device
 */
export function useIsDesktop(breakpoint = 1024): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= breakpoint);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, [breakpoint]);

  return isDesktop;
}

/**
 * Hook to detect if the user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reduceMotion;
}

/**
 * Hook to detect if the device supports hover
 */
export function useHover(): boolean {
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover)");
    setHover(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setHover(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return hover;
}

/**
 * Hook to detect if the device has a coarse pointer (touch)
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    setCoarse(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return coarse;
}

/**
 * Hook to get the current viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateViewport = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return viewport;
}

/**
 * CSS class utilities for responsive design
 */
export const responsive = {
  // Container classes
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  containerNarrow: "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8",
  containerWide: "mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8",

  // Grid classes
  grid2: "grid gap-4 sm:grid-cols-2",
  grid3: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  grid4: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  gridAuto: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",

  // Flex classes
  flexCol: "flex flex-col gap-4",
  flexColMd: "flex flex-col md:flex-row gap-4",
  flexColLg: "flex flex-col lg:flex-row gap-4",

  // Spacing
  section: "py-12 sm:py-16 lg:py-20 xl:py-24",
  sectionSm: "py-8 sm:py-12 lg:py-16",
  sectionLg: "py-16 sm:py-20 lg:py-24 xl:py-28",

  // Text responsive
  heading1: "text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]",
  heading2: "text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1]",
  heading3: "text-[clamp(1.5rem,3vw,2rem)] leading-[1.15]",
  heading4: "text-[clamp(1.25rem,2.5vw,1.75rem)] leading-[1.2]",
  body: "text-[clamp(1rem,2vw,1.125rem)] leading-relaxed",
  bodySm: "text-[clamp(0.875rem,1.5vw,1rem)] leading-relaxed",
  caption: "text-[clamp(0.75rem,1.25vw,0.875rem)] leading-normal",

  // Touch targets
  touchTarget: "min-h-[44px] min-w-[44px]",
  touchTargetSm: "min-h-[40px] min-w-[40px]",
  touchTargetLg: "min-h-[48px] min-w-[48px]",

  // Safe areas
  safeTop: "pt-safe pt-[env(safe-area-inset-top)]",
  safeBottom: "pb-safe pb-[env(safe-area-inset-bottom)]",
  safeLeft: "pl-safe pl-[env(safe-area-inset-left)]",
  safeRight: "pr-safe pr-[env(safe-area-inset-right)]",
};

/**
 * Touch-friendly button classes
 */
export const touchButton = {
  base: "min-h-[44px] min-w-[44px] flex items-center justify-center",
  sm: "h-10 px-3 text-sm",
  md: "h-12 px-4",
  lg: "h-14 px-6",
  xl: "h-14 px-8",
};

/**
 * Form input mobile-friendly classes
 */
export const mobileInput = {
  base: "w-full min-h-[48px] px-4 text-base", // 16px prevents zoom on iOS
  sm: "min-h-[44px] px-3 text-sm",
  lg: "min-h-[56px] px-5 text-lg",
};

/**
 * Container with safe area insets
 */
export const safeContainer = "relative min-h-screen safe-top safe-bottom safe-left safe-right";