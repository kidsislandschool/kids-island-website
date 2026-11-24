"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Props = {
  staffId: number;
  name: string;
  status: "pending" | "approved" | "rejected";
};

export function StaffActionButtons({ staffId, name, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState("");

  async function handleAction(nextStatus: "approved" | "rejected") {
    setLoading(nextStatus);
    setError("");
    try {
      const res = await fetch(`/api/admin/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Action failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  if (status !== "pending") {
    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.08em] ${
          status === "approved" ? "bg-[#EAF9F1] text-[#167A4A]" :
          status === "rejected" ? "bg-[#FFF1F4] text-[#A32D4B]" :
          "bg-paper-2 text-muted"
        }`}
      >
        {status}
      </span>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleAction("approved")}
        disabled={loading !== null}
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-[10.5px] font-extrabold transition disabled:opacity-50",
          loading === "approved"
            ? "bg-[#D8F3E4] text-[#167A4A] cursor-wait"
            : "bg-[#EAF9F1] text-[#167A4A] hover:bg-[#D8F3E4]"
        )}
      >
        <Icon name="check" className="h-3 w-3" strokeWidth={2.8} />
        {loading === "approved" ? "Approving…" : "Approve"}
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={loading !== null}
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-[10.5px] font-extrabold transition disabled:opacity-50",
          loading === "rejected"
            ? "border-[#FCE4EA] bg-[#FCE4EA] text-[#A32D4B] cursor-wait"
            : "border-[#F3C6D1] bg-[#FFF1F4] text-[#A32D4B] hover:bg-[#FCE4EA]"
        )}
      >
        <Icon name="x" className="h-3 w-3" strokeWidth={2.8} />
        {loading === "rejected" ? "Rejecting…" : "Reject"}
      </button>
      {error && <span className="text-[10px] font-bold text-[#A32D4B]">{error}</span>}
    </div>
  );
}