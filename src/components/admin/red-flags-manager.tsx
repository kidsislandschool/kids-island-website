"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { cn, formatDateTime } from "@/lib/utils";
import { adminInput, adminSelect, adminTextarea, AdminField } from "./ui";
import { Modal } from "./collection-manager";

type FlagRow = {
  id: number;
  student_id: number | null;
  reason: string;
  severity: "low" | "medium" | "high" | "critical" | string;
  assigned_at: string;
  resolved: boolean;
  resolution_note?: string | null;
  student?: {
    id: number;
    admission_number: string | null;
    first_name: string;
    last_name: string;
    class: string | null;
    section: string | null;
  } | null;
  assigned_by_user?: { name?: string | null; email?: string | null } | null;
  resolved_by_user?: { name?: string | null; email?: string | null } | null;
};

type Notice = { tone: "success" | "error"; message: string } | null;

const PER_PAGE = 20;

const SEVERITY_TONES: Record<string, string> = {
  low: "bg-[#EAF9F1] text-[#167A4A]",
  medium: "bg-[#FFF6E3] text-[#9A5B00]",
  high: "bg-[#FFF0E4] text-[#A34E00]",
  critical: "bg-[#FFF1F4] text-[#A32D4B]",
};

function studentName(flag: FlagRow) {
  if (!flag.student) return `Student #${flag.student_id ?? "—"}`;
  return [flag.student.first_name, flag.student.last_name].filter(Boolean).join(" ") || `Student #${flag.student.id}`;
}

export function RedFlagsManager() {
  const router = useRouter();
  const [rows, setRows] = useState<FlagRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("active");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [resolveTarget, setResolveTarget] = useState<FlagRow | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [resolving, setResolving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<FlagRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const flash = useCallback((tone: "success" | "error", message: string) => {
    setNotice({ tone, message });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 4200);
  }, []);

  const loadRows = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), perPage: String(PER_PAGE) });
        if (status !== "all") params.set("status", status);
        if (search.trim()) params.set("search", search.trim());
        const res = await fetch(`/api/admin/red-flags?${params.toString()}`, { signal });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Could not load red flags");
        setRows((data.rows ?? []) as FlagRow[]);
        setTotal(Number(data.total) || 0);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        flash("error", (error as Error)?.message ?? "Could not load red flags.");
      } finally {
        setLoading(false);
      }
    },
    [flash, page, search, status]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => void loadRows(controller.signal), search ? 280 : 0);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [loadRows, search]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  async function confirmResolve() {
    if (!resolveTarget) return;
    setResolving(true);
    try {
      const res = await fetch(`/api/admin/red-flags/${resolveTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true, resolutionNote: resolveNote.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("error", data.error ?? "Could not resolve this flag.");
        return;
      }
      setResolveTarget(null);
      setResolveNote("");
      flash("success", "Red flag resolved.");
      await loadRows();
      router.refresh();
    } catch {
      flash("error", "Network error while resolving.");
    } finally {
      setResolving(false);
    }
  }

  async function reopen(flag: FlagRow) {
    try {
      const res = await fetch(`/api/admin/red-flags/${flag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: false, resolutionNote: null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("error", data.error ?? "Could not reopen this flag.");
        return;
      }
      flash("success", "Red flag reopened.");
      await loadRows();
      router.refresh();
    } catch {
      flash("error", "Network error while reopening.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/red-flags/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("error", data.error ?? "Could not delete this flag.");
        return;
      }
      setDeleteTarget(null);
      flash("success", "Red flag deleted.");
      await loadRows();
      router.refresh();
    } catch {
      flash("error", "Network error while deleting.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search red flags</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by reason or resolution note…"
            type="search"
            className={cn(adminInput, "pl-9")}
          />
        </label>
        <label className="sm:w-44">
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={cn(adminSelect, "cursor-pointer")}
          >
            <option value="active">Active flags</option>
            <option value="resolved">Resolved flags</option>
            <option value="all">All flags</option>
          </select>
        </label>
      </div>

      <p className="text-[11px] font-bold text-muted" aria-live="polite">
        {loading ? "Loading…" : `${total} ${total === 1 ? "flag" : "flags"}`}
      </p>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
        {loading && rows.length === 0 ? (
          <div className="px-6 py-14 text-center text-[12px] font-semibold text-muted">Loading red flags…</div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF9F1] text-[#167A4A]">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-display text-[17px] font-semibold text-navy-900">
              {status === "resolved" ? "No resolved flags" : "No red flags"}
            </h3>
            <p className="mt-1 text-[12px] font-semibold text-muted">
              Red flags assigned from the student directory will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-line bg-paper-2/60">
                  {["Student", "Reason", "Severity", "Assigned by", "Assigned", "Status", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      className={cn(
                        "px-4 py-3 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted",
                        heading === "Actions" && "text-right"
                      )}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((flag) => (
                  <tr key={flag.id} className="border-b border-line/70 last:border-0 hover:bg-paper-2/40">
                    <td className="px-4 py-3">
                      <span className="block text-[12px] font-extrabold text-navy-900">{studentName(flag)}</span>
                      <span className="mt-0.5 block max-w-[200px] truncate text-[10.5px] font-semibold text-muted">
                        {flag.student?.class ?? "—"}
                        {flag.student?.section ? ` · ${flag.student.section}` : ""}
                        {flag.student?.admission_number ? ` · ${flag.student.admission_number}` : ""}
                      </span>
                    </td>
                    <td className="max-w-[300px] px-4 py-3">
                      <p className="line-clamp-2 text-[12px] leading-snug text-navy-900">{flag.reason}</p>
                      {flag.resolution_note ? (
                        <p className="mt-1 line-clamp-1 text-[10.5px] font-semibold text-[#167A4A]">
                          Resolution: {flag.resolution_note}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em]",
                          SEVERITY_TONES[flag.severity] ?? SEVERITY_TONES.medium
                        )}
                      >
                        {flag.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11.5px] font-semibold text-muted">
                      {flag.assigned_by_user?.name ?? flag.assigned_by_user?.email ?? "Admin"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-muted">
                      {formatDateTime(flag.assigned_at)}
                    </td>
                    <td className="px-4 py-3">
                      {flag.resolved ? (
                        <span className="inline-flex rounded-full bg-[#EAF9F1] px-2.5 py-1 text-[10px] font-extrabold text-[#167A4A]">
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-[#FFF1F4] px-2.5 py-1 text-[10px] font-extrabold text-[#A32D4B]">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {flag.resolved ? (
                          <button
                            type="button"
                            onClick={() => void reopen(flag)}
                            className="inline-flex h-8 items-center gap-1 rounded-md bg-[#EAF9F1] px-2.5 text-[10.5px] font-extrabold text-[#167A4A] transition hover:bg-[#D8F3E4]"
                          >
                            <Icon name="refresh" className="h-3 w-3" />
                            Reopen
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setResolveTarget(flag);
                              setResolveNote("");
                            }}
                            className="inline-flex h-8 items-center gap-1 rounded-md bg-[#EAF9F1] px-2.5 text-[10.5px] font-extrabold text-[#167A4A] transition hover:bg-[#D8F3E4]"
                          >
                            <Icon name="check" className="h-3 w-3" strokeWidth={2.8} />
                            Resolve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(flag)}
                          aria-label="Delete red flag"
                          className="grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-[#FFF1F4] hover:text-[#A32D4B]"
                        >
                          <Icon name="trash" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <Modal
        open={Boolean(resolveTarget)}
        onClose={() => {
          if (!resolving) setResolveTarget(null);
        }}
        title="Resolve red flag"
        subtitle={resolveTarget ? studentName(resolveTarget) : undefined}
        width="max-w-md"
      >
        <div className="px-5 py-5">
          <p className="text-[12.5px] leading-relaxed text-muted">{resolveTarget?.reason}</p>
          <div className="mt-4">
            <AdminField label="Resolution note (optional)" htmlFor="resolution-note">
              <textarea
                id="resolution-note"
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                rows={3}
                placeholder="What action was taken?"
                className={adminTextarea}
              />
            </AdminField>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setResolveTarget(null)}
              disabled={resolving}
              className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void confirmResolve()}
              disabled={resolving}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#167A4A] px-4 text-[11.5px] font-extrabold text-white transition hover:bg-[#116239] disabled:opacity-50"
            >
              <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.8} />
              {resolving ? "Resolving…" : "Mark resolved"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        title="Delete this red flag?"
        width="max-w-md"
      >
        <div className="px-5 py-5">
          <p className="text-[13px] leading-relaxed text-muted">
            This flag for <strong className="text-navy-900">{deleteTarget ? studentName(deleteTarget) : "this student"}</strong>{" "}
            will be permanently removed.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream disabled:opacity-50"
            >
              Keep it
            </button>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              disabled={deleting}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C23B5A] px-4 text-[11.5px] font-extrabold text-white transition hover:bg-[#A32D4B] disabled:opacity-50"
            >
              <Icon name="trash" className="h-3.5 w-3.5" />
              {deleting ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </div>
      </Modal>

      {notice && (
        <div
          role="status"
          className={cn(
            "fixed bottom-5 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-[12px] font-bold shadow-lift",
            notice.tone === "success" ? "bg-navy text-white" : "bg-[#FFF1F4] text-[#A32D4B]"
          )}
        >
          <Icon name={notice.tone === "success" ? "check-circle" : "alert-triangle"} className="h-4 w-4" />
          {notice.message}
        </div>
      )}
    </div>
  );
}
