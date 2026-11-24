"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { adminSelect, StatusBadge } from "@/components/admin/ui";

type Props = {
  staffId: number;
  name: string;
  status: "pending" | "approved" | "rejected";
};

export function StaffStatusActions({ staffId, name, status }: Props) {
  const router = useRouter();
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction(nextStatus: "approved" | "rejected") {
    setAction(nextStatus);
    setLoading(true);
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
      setLoading(false);
      setAction(null);
    }
  }

  if (status !== "pending") {
    return <StatusBadge status={status} />;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleAction("approved")}
        disabled={loading}
        className="inline-flex h-8 items-center gap-1 rounded-md bg-[#EAF9F1] px-2.5 text-[10.5px] font-extrabold text-[#167A4A] transition hover:bg-[#D8F3E4] disabled:opacity-50"
      >
        <Icon name="check" className="h-3 w-3" strokeWidth={2.8} />
        {action === "approved" && loading ? "Approving…" : "Approve"}
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={loading}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-[#F3C6D1] bg-[#FFF1F4] px-2.5 text-[10.5px] font-extrabold text-[#A32D4B] transition hover:bg-[#FCE4EA] disabled:opacity-50"
      >
        <Icon name="x" className="h-3 w-3" strokeWidth={2.8} />
        {action === "rejected" && loading ? "Rejecting…" : "Reject"}
      </button>
      {error && <span className="text-[10px] font-bold text-[#A32D4B]">{error}</span>}
    </div>
  );
}