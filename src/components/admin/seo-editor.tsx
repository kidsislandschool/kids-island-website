"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SEO_PAGES } from "@/lib/page-registry";
import type { PageSeo } from "@/lib/content";
import type { ContentStatus } from "@/lib/content";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { AdminField, adminInput, adminSelect, adminTextarea, StatusBadge } from "./ui";
import { UploadInput } from "./upload-input";

const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: "published", label: "Published — live metadata" },
  { value: "needs_review", label: "Needs review — hidden overrides" },
  { value: "draft", label: "Draft — hidden overrides" },
];

type SeoMap = Record<string, PageSeo>;

function normalise(value: unknown): SeoMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as SeoMap;
}

function ensureEntry(map: SeoMap, path: string): PageSeo {
  return map[path] ?? { title: "", description: "" };
}

function counterTone(length: number, ideal: number) {
  if (length === 0) return "text-muted";
  if (length <= ideal) return "text-[#167A4A]";
  if (length <= ideal * 1.25) return "text-[#9A5B00]";
  return "text-[#A32D4B]";
}

export function SeoEditor({
  initialValue,
  initialStatus,
  updatedAt,
  initialPage,
}: {
  initialValue: unknown;
  initialStatus: ContentStatus;
  updatedAt?: string;
  initialPage?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<SeoMap>(() => normalise(initialValue));
  const [baseline, setBaseline] = useState(() => JSON.stringify(normalise(initialValue)));
  const [status, setStatus] = useState<ContentStatus>(initialStatus);
  const [baselineStatus, setBaselineStatus] = useState<ContentStatus>(initialStatus);
  const [selected, setSelected] = useState(
    () => SEO_PAGES.find((page) => page.path === initialPage)?.path ?? SEO_PAGES[0]?.path ?? "/"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedAt, setSavedAt] = useState(updatedAt ?? "");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dirty = JSON.stringify(value) !== baseline || status !== baselineStatus;
  const page = SEO_PAGES.find((entry) => entry.path === selected) ?? SEO_PAGES[0];
  const entry = ensureEntry(value, page.path);

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

  function updateEntry(patch: Partial<PageSeo>) {
    setValue((prev) => ({
      ...prev,
      [page.path]: { ...ensureEntry(prev, page.path), ...patch },
    }));
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/content/settings.seo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save SEO settings.");
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

  const configuredCount = SEO_PAGES.filter((seoPage) => Boolean(value[seoPage.path]?.title)).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-[70px] z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-soft backdrop-blur">
        <div className="flex items-center gap-2.5">
          <StatusBadge status={status} />
          <span className="hidden text-[11px] font-semibold text-muted sm:inline">
            {dirty ? "Unsaved changes" : saved ? "All changes saved" : `${configuredCount} of ${SEO_PAGES.length} pages configured`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="seo-status">
            Publication status
          </label>
          <select
            id="seo-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ContentStatus)}
            className={cn(adminSelect, "h-9 w-auto min-w-[215px] text-[11.5px]")}
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
            {saving ? "Saving…" : "Save SEO"}
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
          SEO settings saved. {status === "published" ? "Overrides are live." : "Overrides stay hidden until published."}
        </motion.div>
      )}

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Pages" className="rounded-2xl border border-line bg-white p-2.5 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] lg:sticky lg:top-[150px] lg:self-start">
          <p className="px-2.5 pb-2 pt-1 text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-muted">
            Public pages
          </p>
          <ul className="flex flex-col gap-0.5">
            {SEO_PAGES.map((seoPage) => {
              const active = seoPage.path === page.path;
              const title = value[seoPage.path]?.title;
              return (
                <li key={seoPage.path}>
                  <button
                    type="button"
                    onClick={() => setSelected(seoPage.path)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11.5px] font-extrabold transition",
                      active ? "bg-navy text-white" : "text-navy hover:bg-paper-2"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", title ? "bg-[#4FBF7B]" : "bg-[#E7A1B0]")} />
                    <span className="min-w-0 flex-1 truncate">{seoPage.label}</span>
                    <span className={cn("max-w-[92px] truncate text-[9px] font-bold", active ? "text-white/45" : "text-muted")}>
                      {seoPage.path}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue">{page.label}</p>
                <h2 className="mt-0.5 font-display text-[19px] font-semibold text-navy-900">Search appearance</h2>
              </div>
              <Link
                href={page.path}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-[10.5px] font-extrabold text-navy transition hover:bg-cream"
              >
                <Icon name="eye" className="h-3 w-3" /> View page
              </Link>
            </div>

            {/* search preview */}
            <div className="mt-4 rounded-xl border border-line bg-paper-2/40 p-4">
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-muted">Google preview</p>
              <div className="mt-2.5 max-w-xl">
                <p className="truncate text-[11px] font-semibold text-[#3C7A3C]">
                  kidsaligarh.com{page.path === "/" ? "" : page.path}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[17px] font-semibold leading-snug text-[#1A0DAB]">
                  {entry.title || `${page.label} — Kids Island Senior Secondary School`}
                </p>
                <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-[#4D5156]">
                  {entry.description || "Add a meta description so search engines can summarise this page."}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <AdminField
                label="Meta title"
                htmlFor="seo-title"
                required
                help="Aim for 50–60 characters. The site name is added automatically by the page title template on some screens."
              >
                <input
                  id="seo-title"
                  value={entry.title}
                  onChange={(event) => updateEntry({ title: event.target.value })}
                  placeholder={`${page.label} — Kids Island`}
                  className={adminInput}
                  maxLength={120}
                />
                <p className={cn("text-[10px] font-bold", counterTone(entry.title.length, 60))}>
                  {entry.title.length} characters
                </p>
              </AdminField>

              <AdminField
                label="Meta description"
                htmlFor="seo-description"
                help="Aim for 140–160 characters. This is the snippet shown in search results."
              >
                <textarea
                  id="seo-description"
                  value={entry.description}
                  onChange={(event) => updateEntry({ description: event.target.value })}
                  placeholder="Describe this page in one clear sentence."
                  className={adminTextarea}
                  rows={3}
                  maxLength={320}
                />
                <p className={cn("text-[10px] font-bold", counterTone(entry.description.length, 160))}>
                  {entry.description.length} characters
                </p>
              </AdminField>

              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField
                  label="Canonical path"
                  htmlFor="seo-canonical"
                  help="Optional. Defaults to the page path. Use only if this page is reachable at another URL."
                >
                  <input
                    id="seo-canonical"
                    value={entry.canonical ?? ""}
                    onChange={(event) => updateEntry({ canonical: event.target.value })}
                    placeholder={page.path}
                    className={adminInput}
                  />
                </AdminField>
                <AdminField label="Social share image" htmlFor="seo-og" help="Optional. Falls back to the site icon when empty.">
                  <UploadInput
                    id="seo-og"
                    value={entry.ogImage ?? ""}
                    onChange={(url) => updateEntry({ ogImage: url ?? "" })}
                    kind="image"
                  />
                </AdminField>
              </div>
            </div>
          </div>

          <p className="text-[10.5px] font-semibold text-muted">
            {savedAt ? `Last saved ${new Date(savedAt).toLocaleString("en-IN")}. ` : ""}Saved changes are recorded in the audit log.
          </p>
        </div>
      </div>
    </div>
  );
}
