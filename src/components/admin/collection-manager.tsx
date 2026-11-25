"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CollectionDef, FieldDef } from "@/lib/collections";
import { Icon } from "@/components/ui/icon";
import { DURATION, EASE } from "@/lib/motion";
import { cn, formatDate } from "@/lib/utils";
import {
  AdminField,
  adminInput,
  adminSelect,
  adminTextarea,
  EmptyState,
  StatusBadge,
} from "./ui";
import { UploadInput } from "./upload-input";

type Row = Record<string, unknown> & { id: number };

type Notice = { tone: "success" | "error"; message: string } | null;

function isImageLike(value: unknown) {
  return typeof value === "string" && (/^\/uploads\//.test(value) || /\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(value));
}

function truncateCell(value: unknown, length = 58) {
  if (value === null || value === undefined || value === "") return "—";
  const text = String(value);
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

function emptyValues(def: CollectionDef, options: Record<string, { value: string; label: string }[]>) {
  const values: Record<string, unknown> = {};
  for (const field of def.fields) {
    if (field.name === "status") {
      values[field.name] = def.defaultStatus;
    } else if (field.type === "checkbox") {
      values[field.name] = 0;
    } else if (field.type === "number" || field.type === "order") {
      values[field.name] = 0;
    } else if (field.type === "select") {
      const opts = options[field.name] ?? field.options ?? [];
      values[field.name] = opts[0]?.value ?? "";
    } else {
      values[field.name] = "";
    }
  }
  return values;
}

function editValues(row: Row) {
  const values: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === "id" || key === "created_at" || key === "updated_at") continue;
    values[key] = value ?? "";
  }
  return values;
}

export function CollectionManager({
  collectionKey,
  def,
  initialRows,
  initialTotal,
  optionOverrides,
}: {
  collectionKey: string;
  def: CollectionDef;
  initialRows: Row[];
  initialTotal: number;
  optionOverrides?: Record<string, { value: string; label: string }[]>;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  const titleField = def.fields.find((f) => f.title)?.name ?? "id";
  const tableColumns = def.fields.filter((f) => f.column && !f.title).slice(0, 3);

  const options = { ...Object.fromEntries(def.fields.map((f) => [f.name, f.options ?? []])), ...optionOverrides };

  const flash = useCallback((tone: "success" | "error", message: string) => {
    setNotice({ tone, message });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 4200);
  }, []);

  const loadRows = useCallback(
    async (term: string, status: string, signal?: AbortSignal) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (term.trim()) params.set("search", term.trim());
        if (status !== "all") params.set("status", status);
        const res = await fetch(`/api/admin/collections/${collectionKey}?${params.toString()}`, { signal });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Could not load records");
        setRows(data.rows as Row[]);
        setTotal(Number(data.total) || 0);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        flash("error", (error as Error)?.message ?? "Could not load records.");
      } finally {
        setLoading(false);
      }
    },
    [collectionKey, flash]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void loadRows(search, statusFilter, controller.signal);
    }, search ? 280 : 0);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [search, statusFilter, loadRows]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  function openCreate() {
    setEditing(null);
    setValues(emptyValues(def, options));
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setValues(editValues(row));
    setFormError("");
    setFormOpen(true);
  }

  function setValue(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
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
        ? `/api/admin/collections/${collectionKey}/${editing.id}`
        : `/api/admin/collections/${collectionKey}`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "Could not save this record.");
        return;
      }
      setFormOpen(false);
      flash("success", editing ? `${def.singular} updated.` : `${def.singular} created.`);
      await loadRows(search, statusFilter);
      router.refresh();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function quickPublish(row: Row) {
    try {
      const res = await fetch(`/api/admin/collections/${collectionKey}/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("error", data.error ?? "Could not publish this record.");
        return;
      }
      flash("success", `${def.singular} published.`);
      await loadRows(search, statusFilter);
      router.refresh();
    } catch {
      flash("error", "Network error while publishing.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/collections/${collectionKey}/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("error", data.error ?? "Could not delete this record.");
        return;
      }
      setDeleteTarget(null);
      flash("success", `${def.singular} deleted.`);
      await loadRows(search, statusFilter);
      router.refresh();
    } catch {
      flash("error", "Network error while deleting.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search {def.label}</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${def.label.toLowerCase()}…`}
            type="search"
            className={cn(adminInput, "pl-9")}
          />
        </label>
        <label className="sm:w-44">
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(adminSelect, "cursor-pointer")}
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="needs_review">Needs review</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-navy px-4 text-[12px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="plus" className="h-4 w-4" />
          New {def.singular.toLowerCase()}
        </button>
      </div>

      <p className="text-[11px] font-bold text-muted" aria-live="polite">
        {loading ? "Loading…" : `${total} ${total === 1 ? def.singular.toLowerCase() : def.label.toLowerCase()}`}
        {def.emptyMessage && total === 0 ? ` · ${def.emptyMessage}` : ""}
      </p>

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]">
        {rows.length === 0 ? (
          <EmptyState
            icon={loading ? "clock" : "file"}
            title={loading ? "Loading records…" : `No ${def.label.toLowerCase()} yet`}
            text={def.emptyMessage}
          >
            {!loading && (
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-3.5 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700"
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
                Add the first one
              </button>
            )}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-line bg-paper-2/60">
                  <th className="px-4 py-3 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
                    {def.singular}
                  </th>
                  {tableColumns.map((field) => (
                    <th
                      key={field.name}
                      className="px-4 py-3 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted"
                    >
                      {field.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const title = row[titleField];
                  const image = isImageLike(row.url) ? String(row.url) : isImageLike(row.photo) ? String(row.photo) : isImageLike(row.cover_photo) ? String(row.cover_photo) : null;
                  return (
                    <tr key={row.id} className="border-b border-line/70 last:border-0 hover:bg-paper-2/40">
                      <td className="max-w-[300px] px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image} alt="" className="h-9 w-11 shrink-0 rounded-md border border-line object-cover" />
                          ) : null}
                          <span className="line-clamp-2 text-[12px] font-bold leading-snug text-navy-900">
                            {titleField === "url" ? truncateCell(row.caption ?? "Photo", 46) : truncateCell(title, 72)}
                          </span>
                        </div>
                      </td>
                      {tableColumns.map((field) => (
                        <td key={field.name} className="px-4 py-3 text-[11.5px] font-semibold text-muted">
                          {renderCell(row[field.name], field)}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <StatusBadge status={String(row.status ?? "draft")} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {row.status !== "published" && (
                            <button
                              type="button"
                              onClick={() => void quickPublish(row)}
                              className="inline-flex h-8 items-center gap-1 rounded-md bg-[#EAF9F1] px-2.5 text-[10.5px] font-extrabold text-[#167A4A] transition hover:bg-[#D8F3E4]"
                              title="Publish now"
                            >
                              <Icon name="check" className="h-3 w-3" strokeWidth={2.8} />
                              Publish
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            aria-label={`Edit ${def.singular}`}
                            className="grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-blue-100 hover:text-blue"
                          >
                            <Icon name="edit" className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            aria-label={`Delete ${def.singular}`}
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

      {/* create / edit drawer */}
      <Modal
        open={formOpen}
        onClose={() => {
          if (!saving) setFormOpen(false);
        }}
        title={editing ? `Edit ${def.singular.toLowerCase()}` : `New ${def.singular.toLowerCase()}`}
        subtitle={def.label}
        width="max-w-2xl"
      >
        <form onSubmit={submitForm} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {formError && (
              <div role="alert" className="mb-4 rounded-xl border border-[#F3C6D1] bg-[#FFF1F4] px-4 py-3 text-[12px] font-bold text-[#A32D4B]">
                {formError}
              </div>
            )}
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              {def.fields.map((field) => (
                <CollectionField
                  key={field.name}
                  collectionKey={collectionKey}
                  field={field}
                  value={values[field.name]}
                  options={options[field.name] ?? []}
                  onChange={(next) => setValue(field.name, next)}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line bg-paper-2/50 px-5 py-3.5">
            <p className="text-[10.5px] font-semibold text-muted">Recorded in the audit log.</p>
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
                {saving ? "Saving…" : editing ? "Save changes" : `Create ${def.singular.toLowerCase()}`}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* delete confirmation */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        title={`Delete this ${def.singular.toLowerCase()}?`}
        width="max-w-md"
      >
        <div className="px-5 py-5">
          <p className="text-[13px] leading-relaxed text-muted">
            <strong className="text-navy-900">{truncateCell(deleteTarget?.[titleField] ?? "This record", 90)}</strong> will be
            permanently removed.
            {collectionKey === "gallery_albums" && " All photos inside this album will be deleted too."}
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

      {/* toast */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: reduce ? 0.01 : DURATION.sm, ease: EASE.out }}
            role="status"
            className={cn(
              "fixed bottom-5 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-[12px] font-bold shadow-lift",
              notice.tone === "success" ? "bg-navy text-white" : "bg-[#FFF1F4] text-[#A32D4B]"
            )}
          >
            <Icon name={notice.tone === "success" ? "check-circle" : "alert-triangle"} className="h-4 w-4" />
            {notice.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------- helpers */

function renderCell(value: unknown, field: FieldDef) {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "date") return formatDate(String(value));
  if (field.type === "checkbox") return value ? "Yes" : "No";
  if (field.type === "image" && isImageLike(value)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={String(value)} alt="" className="h-8 w-10 rounded-md border border-line object-cover" />
    );
  }
  return truncateCell(value, 36);
}

function toDateInput(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  return value.slice(0, 10);
}

function CollectionField({
  collectionKey,
  field,
  value,
  options,
  onChange,
}: {
  collectionKey: string;
  field: FieldDef;
  value: unknown;
  options: { value: string; label: string }[];
  onChange: (value: unknown) => void;
}) {
  const id = `${collectionKey}-${field.name}`;
  const full = ["textarea", "richtext", "image", "file"].includes(field.type);
  const current = value ?? "";

  return (
    <AdminField
      label={field.label}
      htmlFor={id}
      required={field.required}
      help={field.help}
      className={full ? "sm:col-span-2" : undefined}
    >
      {field.type === "textarea" || field.type === "richtext" ? (
        <textarea
          id={id}
          value={String(current)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.type === "richtext" ? 7 : 3}
          className={adminTextarea}
        />
      ) : field.type === "image" ? (
        <UploadInput id={id} value={String(current)} onChange={(url) => onChange(url ?? "")} kind="image" />
      ) : field.type === "file" ? (
        <UploadInput id={id} value={String(current)} onChange={(url) => onChange(url ?? "")} kind="file" />
      ) : field.type === "select" ? (
        <select
          id={id}
          value={String(current)}
          onChange={(e) => onChange(e.target.value)}
          className={adminSelect}
        >
          {!field.required && <option value="">— None —</option>}
          {String(current) !== "" && !options.some((o) => o.value === String(current)) && (
            <option value={String(current)}>{String(current)}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === "checkbox" ? (
        <label className="flex h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-white px-3">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked ? 1 : 0)}
            className="h-4 w-4 rounded border-line accent-[#16A34A]"
          />
          <span className="text-[11.5px] font-bold text-navy/70">{value ? "Yes" : "No"}</span>
        </label>
      ) : field.type === "number" || field.type === "order" ? (
        <input
          id={id}
          type="number"
          value={current === "" || current === null ? "" : Number(current)}
          min={field.min}
          max={field.max}
          onChange={(e) => onChange(e.target.value)}
          className={adminInput}
        />
      ) : field.type === "date" ? (
        <input
          id={id}
          type="date"
          value={toDateInput(current)}
          onChange={(e) => onChange(e.target.value)}
          className={adminInput}
        />
      ) : field.type === "tags" ? (
        <input
          id={id}
          value={String(current)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "Comma, separated, values"}
          className={adminInput}
        />
      ) : (
        <input
          id={id}
          type={field.type === "url" ? "text" : "text"}
          value={String(current)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={adminInput}
        />
      )}
    </AdminField>
  );
}

function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex justify-end bg-navy-900/45 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : DURATION.sm }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: reduce ? 0 : 40, opacity: reduce ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: reduce ? 0 : 30, opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : DURATION.sm, ease: EASE.out }}
            className={cn("flex h-full w-full flex-col bg-white shadow-2xl", width)}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                {subtitle && (
                  <p className="text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-blue">{subtitle}</p>
                )}
                <h2 className="font-display text-[19px] font-semibold text-navy-900">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-paper-2 hover:text-navy"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
