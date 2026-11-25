"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { DURATION, EASE } from "@/lib/motion";
import type { ContentField, ContentSchema } from "@/lib/content-schema";
import type { ContentStatus } from "@/lib/content";
import { cn } from "@/lib/utils";
import { AdminField, adminInput, adminSelect, adminTextarea, StatusBadge } from "./ui";
import { UploadInput } from "./upload-input";

const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: "published", label: "Published — visible publicly" },
  { value: "needs_review", label: "Needs review — hidden publicly" },
  { value: "draft", label: "Draft — hidden publicly" },
];

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function normaliseInitial(schema: ContentSchema, value: unknown): unknown {
  const fields = schema.fields ?? [];
  if (schema.shape === "text") return typeof value === "string" ? value : "";
  if (fields.length === 1 && fields[0].name === "__items__") {
    return Array.isArray(value) ? value : [];
  }
  return isPlainObject(value) ? value : {};
}

export function ContentEditor({
  schema,
  initialValue,
  initialStatus,
  updatedAt,
}: {
  schema: ContentSchema;
  initialValue: unknown;
  initialStatus: ContentStatus;
  updatedAt?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<unknown>(() => normaliseInitial(schema, initialValue));
  const [baseline, setBaseline] = useState(() => JSON.stringify(normaliseInitial(schema, initialValue)));
  const [status, setStatus] = useState<ContentStatus>(initialStatus);
  const [baselineStatus, setBaselineStatus] = useState<ContentStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedAt, setSavedAt] = useState(updatedAt ?? "");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dirty = JSON.stringify(value) !== baseline || status !== baselineStatus;

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/content/${encodeURIComponent(schema.key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save this block.");
        return;
      }
      setBaseline(JSON.stringify(value));
      setBaselineStatus(status);
      setSaved(true);
      setSavedAt(new Date().toISOString());
      router.refresh();
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setSaved(false), 5000);
    } catch {
      setError("Network error. Your changes were not saved.");
    } finally {
      setSaving(false);
    }
  }

  const fields = schema.fields ?? [];
  const isItemList = fields.length === 1 && fields[0].name === "__items__";

  return (
    <div className="flex flex-col gap-4">
      {/* save bar */}
      <div className="sticky top-[70px] z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-soft backdrop-blur">
        <div className="flex items-center gap-2.5">
          <StatusBadge status={status} />
          <span className="hidden text-[11px] font-semibold text-muted sm:inline">
            {dirty ? "Unsaved changes" : saved ? "All changes saved" : "No changes"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="content-status">
            Publication status
          </label>
          <select
            id="content-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ContentStatus)}
            className={cn(adminSelect, "h-9 w-auto min-w-[210px] text-[11.5px]")}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setValue(JSON.parse(baseline));
              setStatus(baselineStatus);
            }}
            disabled={!dirty || saving}
            className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3 text-[11.5px] font-extrabold text-navy transition hover:bg-cream disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} />
            )}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-[#F3C6D1] bg-[#FFF1F4] px-4 py-3 text-[12px] font-bold text-[#A32D4B]">
          {error}
        </div>
      )}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.sm, ease: EASE.out }}
          role="status"
          className="flex items-center gap-2 rounded-xl border border-[#CBE7D7] bg-[#EFFAF3] px-4 py-3 text-[12px] font-bold text-[#167A4A]"
        >
          <Icon name="check-circle" className="h-4 w-4" />
          Saved. {status === "published" ? "Your changes are live on the public site." : "This block stays hidden until published."}
        </motion.div>
      )}

      {schema.description && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[#F2DDB0] bg-[#FFF9EE] px-4 py-3">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <p className="text-[11.5px] font-semibold leading-relaxed text-[#7A5200]">{schema.description}</p>
        </div>
      )}

      {status !== "published" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-paper-2 px-4 py-3">
          <Icon name="eye" className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <p className="text-[11.5px] font-semibold leading-relaxed text-muted">
            This block is <strong className="text-navy">{status === "draft" ? "a draft" : "awaiting review"}</strong>{" "}
            and is hidden from the public site. Set it to <strong className="text-navy">Published</strong> and save to make it live.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] sm:p-6">
        {schema.shape === "text" ? (
          <AdminField label={schema.label} htmlFor="content-single-text" help="Displayed exactly as written on the public site.">
            <textarea
              id="content-single-text"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => setValue(e.target.value)}
              className={cn(adminTextarea, "min-h-[80px]")}
              rows={2}
            />
          </AdminField>
        ) : isItemList ? (
          <FieldEditor
            field={fields[0]}
            value={value}
            onChange={setValue}
            idPrefix={schema.key}
          />
        ) : (
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            {fields.map((field) => (
              <FieldEditor
                key={field.name}
                field={field}
                value={isPlainObject(value) ? value[field.name] : undefined}
                onChange={(next) =>
                  setValue((prev: unknown) => ({
                    ...(isPlainObject(prev) ? prev : {}),
                    [field.name]: next,
                  }))
                }
                idPrefix={schema.key}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-[10.5px] font-semibold text-muted">
        {savedAt ? `Last saved ${new Date(savedAt).toLocaleString("en-IN")}.` : "Not saved yet."} All saves are recorded in the audit log.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- field tree */

function FieldEditor({
  field,
  value,
  onChange,
  idPrefix,
}: {
  field: ContentField;
  value: unknown;
  onChange: (value: unknown) => void;
  idPrefix: string;
}) {
  const id = `${idPrefix}-${field.name}`.replace(/[^a-zA-Z0-9-]/g, "-");

  if (field.kind === "object") {
    const obj = isPlainObject(value) ? value : {};
    return (
      <fieldset className="rounded-xl border border-line bg-paper-2/40 p-4 md:col-span-2">
        <legend className="px-1.5 text-[12px] font-extrabold text-navy">{field.label}</legend>
        <div className="mt-1 grid gap-x-5 gap-y-4 md:grid-cols-2">
          {(field.fields ?? []).map((child) => (
            <FieldEditor
              key={child.name}
              field={child}
              value={obj[child.name]}
              onChange={(next) => onChange({ ...obj, [child.name]: next })}
              idPrefix={`${id}-${child.name}`}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.kind === "object-list") {
    const items = Array.isArray(value) ? value : [];
    const labelOf = (item: unknown, index: number) => {
      if (isPlainObject(item) && field.itemLabel && item[field.itemLabel]) {
        return String(item[field.itemLabel]).slice(0, 70);
      }
      return `${field.label} ${index + 1}`;
    };
    return (
      <div className="md:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[12px] font-extrabold text-navy">{field.label}</p>
            {field.help && <p className="text-[10.5px] font-semibold text-muted">{field.help}</p>}
          </div>
          <span className="text-[10.5px] font-bold text-muted">
            {items.length}
            {field.max ? ` / ${field.max}` : ""} item{items.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-xl border border-line bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-line/70 pb-2.5">
                <p className="min-w-0 truncate text-[11.5px] font-extrabold text-navy">
                  <span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-full bg-navy text-[9px] text-white">
                    {index + 1}
                  </span>
                  {labelOf(item, index)}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...items];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      onChange(next);
                    }}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted transition hover:bg-paper-2 hover:text-navy disabled:opacity-30"
                  >
                    <Icon name="chevron-up" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === items.length - 1}
                    onClick={() => {
                      const next = [...items];
                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                      onChange(next);
                    }}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted transition hover:bg-paper-2 hover:text-navy disabled:opacity-30"
                  >
                    <Icon name="chevron-down" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete item"
                    onClick={() => onChange(items.filter((_, i) => i !== index))}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted transition hover:bg-[#FFF1F4] hover:text-[#A32D4B]"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-x-5 gap-y-4 md:grid-cols-2">
                {(field.fields ?? []).map((child) => (
                  <FieldEditor
                    key={child.name}
                    field={child}
                    value={isPlainObject(item) ? item[child.name] : undefined}
                    onChange={(next) => {
                      const copy = [...items];
                      copy[index] = { ...(isPlainObject(item) ? item : {}), [child.name]: next };
                      onChange(copy);
                    }}
                    idPrefix={`${id}-${index}-${child.name}`}
                  />
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const blank: Record<string, unknown> = {};
              for (const child of field.fields ?? []) {
                blank[child.name] =
                  child.kind === "boolean"
                    ? false
                    : child.kind === "number"
                    ? 0
                    : child.kind === "select"
                    ? child.options?.[0]?.value ?? ""
                    : child.kind === "string-list"
                    ? []
                    : child.kind === "object-list"
                    ? []
                    : "";
              }
              onChange([...items, blank]);
            }}
            disabled={Boolean(field.max && items.length >= field.max)}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-dashed border-navy/20 bg-paper-2/50 px-3.5 py-2 text-[11.5px] font-extrabold text-navy transition hover:border-blue/40 hover:bg-blue-100/40 disabled:opacity-40"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
            {field.addLabel ?? `Add ${field.label.toLowerCase()}`}
          </button>
        </div>
      </div>
    );
  }

  if (field.kind === "string-list") {
    const items = Array.isArray(value) ? value.map(String) : [];
    return (
      <div className="md:col-span-2">
        <p className="text-[12px] font-extrabold text-navy">{field.label}</p>
        {field.help && <p className="text-[10.5px] font-semibold text-muted">{field.help}</p>}
        <div className="mt-2 flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={item}
                onChange={(e) => {
                  const copy = [...items];
                  copy[index] = e.target.value;
                  onChange(copy);
                }}
                placeholder={field.placeholder}
                className={adminInput}
                aria-label={`${field.label} ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label={`Remove ${field.label} ${index + 1}`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-white text-muted transition hover:bg-[#FFF1F4] hover:text-[#A32D4B]"
              >
                <Icon name="trash" className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange([...items, ""])}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-dashed border-navy/20 bg-paper-2/50 px-3.5 py-2 text-[11.5px] font-extrabold text-navy transition hover:border-blue/40 hover:bg-blue-100/40"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
            {field.placeholder ?? "Add item"}
          </button>
        </div>
      </div>
    );
  }

  const common = {
    id,
    name: field.name,
  };

  const spanFull = ["textarea", "richtext", "image"].includes(field.kind);

  return (
    <AdminField
      label={field.label}
      htmlFor={id}
      required={field.required}
      help={field.help}
      className={spanFull ? "md:col-span-2" : undefined}
    >
      {field.kind === "textarea" || field.kind === "richtext" ? (
        <textarea
          {...common}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={adminTextarea}
          rows={field.kind === "richtext" ? 6 : 3}
        />
      ) : field.kind === "image" ? (
        <UploadInput
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={(url) => onChange(url ?? "")}
          kind="image"
        />
      ) : field.kind === "select" ? (
        <select
          {...common}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={adminSelect}
        >
          <option value="">Choose…</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.kind === "number" ? (
        <input
          {...common}
          type="number"
          value={typeof value === "number" ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className={adminInput}
        />
      ) : field.kind === "boolean" ? (
        <label className="flex h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-white px-3">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-line text-blue accent-[#16A34A]"
          />
          <span className="text-[11.5px] font-bold text-navy/70">
            {value ? "Enabled" : "Disabled"}
          </span>
        </label>
      ) : (
        <input
          {...common}
          type={field.kind === "url" ? "text" : "text"}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={adminInput}
        />
      )}
    </AdminField>
  );
}
