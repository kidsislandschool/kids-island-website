"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Opening a new inquiry marks it as read and records the access once per mount.
 */
export function InquiryAutoRead({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (status !== "new" || fired.current) return;
    fired.current = true;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/admin/inquiries/${id}/view`, { method: "POST" });
        if (res.ok && !cancelled) router.refresh();
      } catch {
        // Viewing the enquiry still works; the status can be changed manually.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, status, router]);

  return null;
}
