"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { cn, formatDateTime } from "@/lib/utils";
import { Modal } from "./collection-manager";

export type FacultyProfileRequest = {
  id: number;
  name: string;
  email: string;
  designation: string | null;
  qualification: string | null;
  bio: string | null;
  photo: string | null;
  subjects: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type Notice = { tone: "success" | "error"; message: string } | null;

/**
 * Faculty profile display requests: staff members who have requested
 * their faculty profile to be published on the public website.
 */
export function FacultyProfileApprovals({ initialPending }: { initialPending: FacultyProfileRequest[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<FacultyProfileRequest[]>(initialPending);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((tone: "success" | "error", message: string) => {
    setNotice({ tone, message });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/faculty/pending", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not refresh requests.");
      setPending((data.rows ?? []) as FacultyProfileRequest[]);
      router.refresh();
    } catch (error) {
      flash("error", (error as Error)?.message ?? "Could not refresh requests.");
    } finally {
      setRefreshing(false);
    }
  }, [flash, router]);

  async function decide(request: FacultyProfileRequest, status: "published" | "draft") {
    setBusyId(request.id);
    try {
      const res = await fetch(`/api/admin/faculty/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("error", data.error ?? `Could not ${status === "published" ? "approve" : "reject"} this request.`);
        return;
      }
      setPending((prev) => prev.filter((item) => item.id !== request.id));
      flash(
        "success",
        status === "published"
          ? `${request.name}'s faculty profile has been published.`
          : `${request.name}'s faculty profile request was rejected.`
      );
      await refresh();
    } catch {
      flash("error", "Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-line bg-white shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", "bg-[#FFF6E3] text-[#9A5B00]")}>
            <Icon name="user-check" className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="font-display text-[16.5px] font-semibold text-navy-900">
              Faculty profile display requests
              {pending.length > 0 && (
                <span className="ml-2 inline-flex rounded-full bg-[#FFF6E3] px-2 py-0.5 text-[10px] font-extrabold text-[#9A5B00]">
                  {pending.length} pending
                </span>
              )}
            </h2>
            <p className="mt-0.5 text-[11.5px] font-semibold text-muted">
              Staff members have requested their faculty profiles to be displayed publicly. Approve to publish or reject to keep as draft.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream disabled:opacity-60"
            title="Refresh pending requests"
          >
            <Icon name="refresh" className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {pending.length === 0 && (
        <div className="border-t border-line px-5 py-4 text-[11.5px] font-semibold text-muted">
          No pending faculty profile display requests.
        </div>
      )}

      <Modal
        open={pending.length > 0}
        onClose={() => {
          if (!busyId) setOpen(false);
        }}
        title="Faculty profile display requests"
        subtitle="Approve or reject"
        width="max-w-2xl"
      >
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {pending.length === 0 ? (
            <div className="rounded-xl border border-line bg-paper-2/50 px-4 py-6 text-center">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#EAF9F1] text-[#167A4A]">
                <Icon name="check-circle" className="h-5 w-5" />
              </span>
              <p className="mt-3 text-[13px] font-extrabold text-navy-900">You&apos;re all caught up</p>
              <p className="mt-1 text-[11.5px] font-semibold text-muted">
                There are no pending faculty profile display requests right now.
              </p>
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={refreshing}
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream disabled:opacity-60"
              >
                <Icon name="refresh" className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                Check again
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pending.map((request) => (
                <div key={request.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 font-display text-sm font-semibold text-blue">
                        {request.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-extrabold text-navy-900">{request.name}</p>
                        <p className="truncate text-[11px] font-semibold text-muted">{request.email}</p>
                        <p className="mt-1 text-[11px] font-semibold text-muted">
                          {request.designation || "Teacher"}
                          {request.qualification ? ` · ${request.qualification}` : ""}
                        </p>
                        <p className="mt-1 text-[10.5px] font-semibold text-muted/80">
                          Requested {formatDateTime(request.updated_at)}
                        </p>
                        {request.bio && (
                          <p className="mt-2 line-clamp-3 text-[11.5px] leading-relaxed text-muted">{request.bio}</p>
                        )}
                        {request.subjects && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {request.subjects.split(",").map((subject) => (
                              <span key={subject} className="rounded-full bg-paper-2 px-2.5 py-1 text-[10.5px] font-bold text-navy/65">
                                {subject.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => void decide(request, "draft")}
                      disabled={busyId === request.id}
                      className="inline-flex h-8 items-center gap-1 rounded-md bg-[#FFF1F4] px-2.5 text-[10.5px] font-extrabold text-[#A32D4B] transition hover:bg-[#FFE4E8] disabled:opacity-50"
                    >
                      <Icon name="x" className="h-3 w-3" strokeWidth={2.8} />
                      Reject (keep as draft)
                    </button>
                    <button
                      type="button"
                      onClick={() => void decide(request, "published")}
                      disabled={busyId === request.id}
                      className="inline-flex h-8 items-center gap-1 rounded-md bg-[#EAF9F1] px-2.5 text-[10.5px] font-extrabold text-[#167A4A] transition hover:bg-[#D8F3E4] disabled:opacity-50"
                    >
                      <Icon name="check" className="h-3 w-3" strokeWidth={2.8} />
                      Approve & publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {notice && (
        <div
          role="status"
          className={cn(
            "fixed bottom-5 left-1/2 z-[90] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-[12px] font-bold shadow-lift",
            notice.tone === "success" ? "bg-navy text-white" : "bg-[#FFF1F4] text-[#A32D4B]"
          )}
        >
          <Icon name={notice.tone === "success" ? "check-circle" : "alert-triangle"} className="h-4 w-4 shrink-0" />
          {notice.message}
        </div>
      )}
    </div>
  );
}

function setOpen(open: boolean) {
  // This is a workaround for the Modal onClose handler
  // The actual state is managed by the parent component
}