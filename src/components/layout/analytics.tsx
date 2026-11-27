"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Page view tracking for analytics.
 * Sends page view data to the analytics API on navigation.
 */
function AnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTracked = useRef(false);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trackPageView = () => {
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
    
    // Debounce to avoid tracking too many rapid navigations
    pendingTimer.current = setTimeout(() => {
      const path = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      
      fetch("/api/analytics/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          referrer: typeof document !== "undefined" ? document.referrer : "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
      }).catch(() => {
        // Silently fail - analytics shouldn't break the app
      });
    }, 100);
  };

  useEffect(() => {
    // Track initial page load
    if (!hasTracked.current) {
      hasTracked.current = true;
      trackPageView();
    } else {
      // Track subsequent navigations
      trackPageView();
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    return () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, []);

  return null; // This component doesn't render anything
}

export function Analytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  );
}