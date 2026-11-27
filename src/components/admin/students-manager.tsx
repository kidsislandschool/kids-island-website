"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CollectionDef, FieldDef } from "@/lib/collections";
import { Icon } from "@/components/ui/icon";
import { cn, formatDateTime } from "@/lib/utils";
import { adminInput, adminSelect, adminTextarea, AdminField } from "./ui";
import { CollectionField, Modal } from "./collection-manager";

type Row = Record<string, unknown> & { id: number };

type FlagRow = {
  id: number;
  student_id: number;
  reason: string;
  severity: "low" | "medium" | "high" | "critical" | string;
  assigned_at: string;
  resolved: boolean;
  resolution_note?: string | null;
  assigned_by_user?: { name?: string | null; email?: string | null } | null;
};

type Notice = { tone: "success" | "error"; message: string } | null;

const PER_PAGE = 50;

const SEVERITY_TONES: Record<string, string> = {
  low: "bg-[#EAF9F1] text-[#167A4A]",
  medium: "bg-[#FFF6E3] text-[#9A5B00]",
  high: "bg-[#FFF0E4] text-[#A34E00]",
  critical: "bg-[#FFF1F4] text-[#A32D4B]",
};

function fullName(row: Row) {
  const first = String(row.first_name ?? "").trim();
  const last = String(row.last_name ?? "").trim();
  return [first, last].filter(Boolean).join(" ") || "Unnamed student";
}

function classOrderFor(value: string) {
  const key = value.trim().toLowerCase();
  if (key === "play group" || key === "nursery") return 0;
  if (key === "lkg") return 1;
  if (key === "ukg") return 2;
  const numeric = Number(key.replace(/[^0-9]/g, ""));
  return Number.isFinite(numeric) ? numeric + 2 : 99;
}

function emptyStudentValues(def: CollectionDef) {
  const values: Record<string, unknown> = {};
  for (const field of def.fields) {
    if (field.name === "status") values[field.name] = def.defaultStatus;
    else if (field.type === "checkbox") values[field.name] = 0;
    else if (field.type === "number" || field.type === "order") values[field.name] = 0;
    else if (field.type === "select") values[field.name] = field.options?.[0]?.value ?? "";
    else values[field.name] = "";
  }
  return values;
}

function editStudentValues(row: Row) {
  const values: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === "id" || key === "created_at" || key === "updated_at") continue;
    values[key] = value ?? "";
  }
  return values;
}

/** Ordered class list for sidebar */
const CLASS_ORDER = [
  "Play Group",
  "LKG",
  "UKG",
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
];

/** Get display label for class */
function classLabel(cls: string) {
  if (cls === "Play Group") return "Play Group";
  if (cls === "LKG") return "LKG";
  if (cls === "UKG") return "UKG";
  return `Class ${cls}`;
}

/** Build sidebar items with class + section breakdown */
function buildSidebarItems(
  classCounts: Map<string, number>,
  sectionCounts: Map<string, Map<string, number>>,
  totalStudents: number
) {
  const items: Array<{ key: string; label: string; count: number; isSection?: boolean; parentClass?: string }> = [
    { key: "all", label: "All Students", count: totalStudents },
  ];

  for (const cls of CLASS_ORDER) {
    const classCount = classCounts.get(cls) ?? 0;
    if (classCount === 0) continue;

    items.push({
      key: cls,
      label: classLabel(cls),
      count: classCount,
      isSection: false,
    });

    // Add sections for this class
    const sections = sectionCounts.get(cls);
    if (sections) {
      for (const [section, count] of sections) {
        if (count > 0) {
          items.push({
            key: `${cls}|${section}`,
            label: `  Section ${section}`,
            count,
            isSection: true,
            parentClass: cls,
          });
        }
      }
    }
  }

  return items;
}

/** Get count of students per class from initial data */
function getClassCounts(rows: Row[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const cls = String(row.class ?? "");
    counts.set(cls, (counts.get(cls) ?? 0) + 1);
  }
  return counts;
}

/** Get count of students per class AND section */
function getSectionCounts(rows: Row[]): Map<string, Map<string, number>> {
  const counts = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const cls = String(row.class ?? "");
    const section = String(row.section ?? "").trim();
    if (!counts.has(cls)) counts.set(cls, new Map());
    const classMap = counts.get(cls)!;
    classMap.set(section, (classMap.get(section) ?? 0) + 1);
  }
  return counts;
}

export function StudentsManager({
  def,
  initialRows,
  initialTotal,
  initialFlags,
  classCounts,
}: {
  def: CollectionDef;
  initialRows: Row[];
  initialTotal: number;
  initialFlags: FlagRow[];
  classCounts: Map<string, number>;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all"); // "all" or "class" or "class|section"
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [flags, setFlags] = useState<FlagRow[]>(initialFlags);
  const [flagStudent, setFlagStudent] = useState<Row | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagSeverity, setFlagSeverity] = useState("medium");
  const [flagSaving, setFlagSaving] = useState(false);
  const [flagError, setFlagError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Calculate section counts from initial data
  const sectionCounts = getSectionCounts(initialRows);
  // Class counts for sidebar badges
  const totalStudents = initialTotal;

  const flash = useCallback((tone: "success" | "error", message: string) => {
    setNotice({ tone, message });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 4500);
  }, []);

  const loadRows = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), perPage: String(PER_PAGE) });
        if (search.trim()) params.set("search", search.trim());
        if (selectedClass !== "all") {
          // Handle section filtering: format is "class|section"
          if (selectedClass.includes("|")) {
            const [cls, section] = selectedClass.split("|");
            params.set("class", cls);
            params.set("section", section);
          } else {
            params.set("class", selectedClass);
          }
        }
        const res = await fetch(`/api/admin/collections/students?${params.toString()}`, { signal });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Could not load students");
        setRows((data.rows ?? []) as Row[]);
        setTotal(Number(data.total) || 0);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        flash("error", (error as Error)?.message ?? "Could not load students.");
      } finally {
        setLoading(false);
      }
    },
    [flash, page, search, selectedClass]
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

  function openCreate() {
    setEditing(null);
    setValues(emptyStudentValues(def));
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setValues(editStudentValues(row));
    setFormError("");
    setFormOpen(true);
  }

  function setValue(name: string, value: unknown) {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "class" && !editing) {
        next.class_order = classOrderFor(String(value ?? ""));
      }
      if (name === "admission_number" && !editing) next.enrollment_status = prev.enrollment_status || "active";
      return next;
    });
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    const payload: Record<string, unknown> = {};
    for (const field of def.fields) {
      const raw = values[field.name];
      if (field.type === "checkbox") payload[field.name] = raw ? 1 : 0;
      else if (field.type === "number" || field.type === "order") {
        payload[field.name] = raw === "" || raw === null || raw === undefined ? 0 : Number(raw);
      } else {
        payload[field.name] = raw === "" ? null : raw;
      }
    }

    try {
      const url = editing
        ? `/api/admin/collections/students/${editing.id}`
        : "/api/admin/collections/students";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "Could not save this student.");
        return;
      }
      setFormOpen(false);
      flash("success", editing ? "Student updated." : "Student added.");
      if (!editing) setPage(1);
      await loadRows();
      router.refresh();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/collections/students/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("error", data.error ?? "Could not delete this student.");
        return;
      }
      setDeleteTarget(null);
      flash("success", "Student removed.");
      setFlags((prev) => prev.filter((f) => f.student_id !== deleteTarget.id));
      await loadRows();
      router.refresh();
    } catch {
      flash("error", "Network error while deleting.");
    } finally {
      setDeleting(false);
    }
  }

  function openFlagDialog(row: Row) {
    setFlagStudent(row);
    setFlagReason("");
    setFlagSeverity("medium");
    setFlagError("");
  }

  async function refreshFlags() {
    try {
      const res = await fetch("/api/admin/red-flags?status=active&perPage=2000");
      const data = await res.json().catch(() => ({}));
      if (res.ok) setFlags((data.rows ?? []) as FlagRow[]);
    } catch {
      /* keep the current list */
    }
  }

  async function submitFlag(event: React.FormEvent) {
    event.preventDefault();
    if (!flagStudent) return;
    setFlagSaving(true);
    setFlagError("");
    try {
      const res = await fetch("/api/admin/red-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: flagStudent.id, reason: flagReason, severity: flagSeverity }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFlagError(data.error ?? "Could not add the red flag.");
        return;
      }
      setFlagReason("");
      flash("success", "Red flag added.");
      await refreshFlags();
      router.refresh();
    } catch {
      setFlagError("Network error. Please try again.");
    } finally {
      setFlagSaving(false);
    }
  }

  async function resolveFlag(flag: FlagRow) {
    try {
      const res = await fetch(`/api/admin/red-flags/${flag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true, resolutionNote: "Resolved from the student directory" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("error", data.error ?? "Could not resolve this flag.");
        return;
      }
      flash("success", "Red flag resolved.");
      await refreshFlags();
      router.refresh();
    } catch {
      flash("error", "Network error while resolving.");
    }
  }

  const studentFlags = flagStudent ? flags.filter((f) => f.student_id === flagStudent.id) : [];

  // Build sidebar items with class + section breakdown
  const sidebarItems = buildSidebarItems(classCounts, sectionCounts, totalStudents);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-200px)]">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search students</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, admission number, parent or phone…"
            type="search"
            className={cn(adminInput, "pl-9")}
          />
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-muted">
            {selectedClass === "all" ? "All Students" : 
              selectedClass.includes("|") 
                ? `${classLabel(selectedClass.split("|")[0])} · Section ${selectedClass.split("|")[1]}`
                : classLabel(selectedClass)
            }
          </span>
          {selectedClass !== "all" && (
            <button
              type="button"
              onClick={() => { setSelectedClass("all"); setPage(1); }}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-paper-2 px-2.5 text-[10.5px] font-extrabold text-navy/60 transition hover:bg-paper-3"
            >
              <Icon name="x" className="h-3 w-3" /> Clear filter
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-4">
        {/* Sidebar - Class Folders */}
        <aside className="w-64 flex-shrink-0 overflow-y-auto rounded-2xl border border-line bg-white shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] p-2">
          <nav className="space-y-1" aria-label="Classes">
            {sidebarItems.map((item) => {
              const isSection = item.isSection === true;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => { setSelectedClass(item.key); setPage(1); }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 rounded-xl text-left transition",
                    isSection ? "px-5 py-2 text-[11px]" : "px-3 py-2.5",
                    selectedClass === item.key
                      ? "bg-navy text-white"
                      : "text-navy hover:bg-paper-2"
                  )}
                  aria-current={selectedClass === item.key ? "page" : undefined}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isSection ? (
                      <Icon name="book-open" className="h-4 w-4 shrink-0 text-muted" />
                    ) : (
                      <Icon name={item.key === "all" ? "users" : "folder"} className="h-5 w-5 shrink-0" />
                    )}
                    <span className={cn(
                      "font-semibold truncate",
                      isSection ? "text-[11px]" : "text-[12px]"
                    )}>
                      {item.label}
                    </span>
                  </div>
                  {item.count > 0 && (
                    <span className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                      selectedClass === item.key ? "bg-white/20 text-white" : "bg-paper-2 text-muted"
                    )}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content - Students Table */}
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 px-2">
            <p className="text-[11px] font-bold text-muted" aria-live="polite">
              {loading ? "Loading…" : `${total.toLocaleString()} ${total === 1 ? "student" : "students"}`}
              {selectedClass !== "all" ? (selectedClass.includes("|")
                ? ` · ${classLabel(selectedClass.split("|")[0])} · Section ${selectedClass.split("|")[1]}`
                : ` · ${classLabel(selectedClass)}`
              ) : ""}
              {flags.length > 0 ? ` · ${flags.length} active red flag${flags.length === 1 ? "" : "s"}` : ""}
            </p>
            {totalPages > 1 && (
              <span className="text-[11px] font-bold text-muted">
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
            {rows.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-paper-2 text-muted">
                  <Icon name={loading ? "clock" : "user-group"} className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-[17px] font-semibold text-navy-900">
                  {loading ? "Loading students…" : "No students match these filters"}
                </h3>
                <p className="mt-1 text-[12px] font-semibold text-muted">
                  {loading ? "Fetching the class list." : "Try a different class, section or search term."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left">
                  <thead>
                    <tr className="border-b border-line bg-paper-2/60">
                      {["Student", "Class", "Parent", "Contact", "Red flags", "Actions"].map((heading) => (
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
                    {rows.map((row) => {
                      const count = flags.filter((f) => f.student_id === row.id).length;
                      return (
                        <tr key={row.id} className="border-b border-line/70 last:border-0 hover:bg-paper-2/40">
                          <td className="max-w-[260px] px-4 py-3">
                            <span className="block truncate text-[12px] font-extrabold text-navy-900">{fullName(row)}</span>
                            <span className="mt-0.5 block text-[10.5px] font-semibold text-muted">
                              {row.admission_number ? `Adm. ${row.admission_number}` : "No admission no."}
                              {row.enrollment_status && row.enrollment_status !== "active" ? ` · ${row.enrollment_status}` : ""}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[11.5px] font-bold text-navy/75">
                            {row.class || "—"}
                            {row.section ? ` · ${row.section}` : ""}
                            {row.serial_no ? <span className="ml-1 text-[10.5px] font-semibold text-muted">#{String(row.serial_no)}</span> : null}
                          </td>
                          <td className="max-w-[180px] px-4 py-3">
                            <span className="block truncate text-[11.5px] font-semibold text-muted">{row.father_name ? String(row.father_name) : "—"}</span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-muted">
                            {row.phone ? String(row.phone) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {count > 0 ? (
                              <button
                                type="button"
                                onClick={() => openFlagDialog(row)}
                                className="inline-flex items-center gap-1 rounded-full bg-[#FFF1F4] px-2.5 py-1 text-[10.5px] font-extrabold text-[#A32D4B] transition hover:bg-[#FFE4E8]"
                                title="Manage red flags"
                              >
                                <Icon name="alert-triangle" className="h-3 w-3" />
                                {count} active
                              </button>
                            ) : (
                              <span className="text-[10.5px] font-bold text-muted">Clear</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openFlagDialog(row)}
                                className="inline-flex h-8 items-center gap-1 rounded-md border border-line bg-white px-2 text-[10.5px] font-extrabold text-[#A32D4B] transition hover:bg-[#FFF1F4]"
                                title="Assign or resolve a red flag"
                              >
                                <Icon name="alert-triangle" className="h-3 w-3" />
                                Flag
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(row)}
                                aria-label="Edit student"
                                className="grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-blue-100 hover:text-blue"
                              >
                                <Icon name="edit" className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(row)}
                                aria-label="Delete student"
                                className="grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-[#FFF1F4] hover:text-[#A32D4B]"
                              >
                                <Icon name="trash" className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 mt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-[11.5px] font-bold text-muted">
                {page} / {totalPages}
              </span>
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
        </div>
      </div>

      {/* create / edit */}
      <Modal
        open={formOpen}
        onClose={() => {
          if (!saving) setFormOpen(false);
        }}
        title={editing ? "Edit student" : "New student"}
        subtitle="Student directory"
        width="max-w-3xl"
      >
        <form onSubmit={submitForm} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {formError && (
              <div role="alert" className="mb-4 rounded-xl border border-[#F3C6D1] bg-[#FFF1F4] px-4 py-3 text-[12px] font-bold text-[#A32D4B]">
                {formError}
              </div>
            )}
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              {def.fields.map((field: FieldDef) => (
                <CollectionField
                  key={field.name}
                  collectionKey="students"
                  field={field}
                  value={values[field.name]}
                  options={field.options ?? []}
                  onChange={(next) => setValue(field.name, next)}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line bg-paper-2/50 px-5 py-3.5">
            <p className="text-[10.5px] font-semibold text-muted">
              {editing ? "Changes are recorded in the audit log." : "Class order is set automatically from the class."}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700 disabled:opacity-50"
              >
                {saving ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} />
                )}
                {saving ? "Saving…" : editing ? "Save changes" : "Add student"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* red flags */}
      <Modal
        open={Boolean(flagStudent)}
        onClose={() => {
          if (!flagSaving) setFlagStudent(null);
        }}
        title={flagStudent ? fullName(flagStudent) : "Red flags"}
        subtitle="Discipline record"
        width="max-w-lg"
      >
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {flagStudent && (
            <p className="text-[11.5px] font-semibold text-muted">
              {flagStudent.class ? String(flagStudent.class) : "—"}
              {flagStudent.section ? ` · Section ${String(flagStudent.section)}` : ""}
              {flagStudent.admission_number ? ` · Adm. ${String(flagStudent.admission_number)}` : ""}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-muted">Active flags</p>
            {studentFlags.length === 0 ? (
              <p className="rounded-xl border border-line bg-paper-2/50 px-4 py-3 text-[11.5px] font-semibold text-muted">
                No active red flags for this student.
              </p>
            ) : (
              studentFlags.map((flag) => (
                <div key={flag.id} className="rounded-xl border border-line bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.1em]",
                        SEVERITY_TONES[flag.severity] ?? SEVERITY_TONES.medium
                      )}
                    >
                      {flag.severity}
                    </span>
                    <span className="text-[10px] font-semibold text-muted">{formatDateTime(flag.assigned_at)}</span>
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-navy-900">{flag.reason}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-muted">
                      {flag.assigned_by_user?.name ?? flag.assigned_by_user?.email ?? "Admin"}
                    </span>
                    <button
                      type="button"
                      onClick={() => void resolveFlag(flag)}
                      className="inline-flex h-7 items-center gap-1 rounded-md bg-[#EAF9F1] px-2.5 text-[10px] font-extrabold text-[#167A4A] transition hover:bg-[#D8F3E4]"
                    >
                      <Icon name="check" className="h-3 w-3" strokeWidth={2.8} />
                      Resolve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={submitFlag} className="mt-5 flex flex-col gap-3 border-t border-line pt-4">
            <AdminField label="Add a red flag" htmlFor="flag-reason" required>
              <textarea
                id="flag-reason"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                rows={3}
                required
                placeholder="Describe the incident or concern…"
                className={adminTextarea}
              />
            </AdminField>
            <AdminField label="Severity" htmlFor="flag-severity" required>
              <select
                id="flag-severity"
                value={flagSeverity}
                onChange={(e) => setFlagSeverity(e.target.value)}
                className={adminSelect}
              >
                <option value="low">Low — minor concern</option>
                <option value="medium">Medium — repeated or moderate issue</option>
                <option value="high">High — serious behavioural concern</option>
                <option value="critical">Critical — needs immediate action</option>
              </select>
            </AdminField>
            {flagError && <p className="text-[11px] font-bold text-[#A32D4B]">{flagError}</p>}
            <button
              type="submit"
              disabled={flagSaving || !flagReason.trim()}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#C23B5A] px-4 text-[11.5px] font-extrabold text-white transition hover:bg-[#A32D4B] disabled:opacity-50"
            >
              <Icon name="alert-triangle" className="h-3.5 w-3.5" />
              {flagSaving ? "Saving…" : "Assign red flag"}
            </button>
            <p className="text-[10px] font-semibold text-muted">
              Only administrators can assign or resolve red flags. Every action is recorded in the audit log.
            </p>
          </form>
        </div>
      </Modal>

      {/* delete */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        title="Remove this student?"
        width="max-w-md"
      >
        <div className="px-5 py-5">
          <p className="text-[13px] leading-relaxed text-muted">
            <strong className="text-navy-900">{deleteTarget ? fullName(deleteTarget) : "This student"}</strong> will be
            permanently removed from the directory, along with their red flags.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3.5 text-[11.5px] font-extrabold text-navy transition hover:bg-cream disabled:opacity-50"
            >
              Keep student
            </button>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              disabled={deleting}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C23B5A] px-4 text-[11.5px] font-extrabold text-white transition hover:bg-[#A32D4B] disabled:opacity-50"
            >
              <Icon name="trash" className="h-3.5 w-3.5" />
              {deleting ? "Removing…" : "Remove permanently"}
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