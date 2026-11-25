"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Pagination } from "@/components/ui/pagination";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

interface Notice {
  id: number;
  title: string;
  summary: string | null;
  body: string | null;
  category: string;
  event_date: string | null;
  pinned: number;
  published_at: string | null;
  created_at: string;
}

interface NoticeListProps {
  initialNotices: Notice[];
  categories: string[];
  currentCategory: string | undefined;
  currentPage: number;
  totalPages: number;
  total: number;
  searchQuery?: string;
}

export function NoticeList({
  initialNotices,
  categories,
  currentCategory,
  currentPage,
  totalPages,
  total,
  searchQuery,
}: NoticeListProps) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(currentPage);
  const [totalPagesState, setTotalPages] = useState(totalPages);
  const [totalCount, setTotalCount] = useState(total);
  const [query, setQuery] = useState(searchQuery ?? "");
  const [category, setCategory] = useState(currentCategory ?? "");
  const filtersKey = useRef(`${searchQuery ?? ""}|${currentCategory ?? ""}`);

  const syncUrl = useCallback((q: string, cat: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    const qs = params.toString();
    // Shallow URL update — no server roundtrip.
    window.history.replaceState(null, "", `/notices${qs ? `?${qs}` : ""}`);
  }, []);

  const fetchNotices = useCallback(async (pageNum: number, q: string, cat: string) => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    params.set("page", String(pageNum));
    params.set("perPage", "9");

    try {
      const res = await fetch(`/api/notices?${params.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNotices(data.rows);
        setTotalPages(data.pages);
        setTotalCount(data.total);
        setPage(data.page);
      }
    } catch (e) {
      console.error("Failed to fetch notices:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refetch when the server streamed in new filter values (page navigation).
  useEffect(() => {
    const key = `${searchQuery ?? ""}|${currentCategory ?? ""}`;
    if (key !== filtersKey.current) {
      filtersKey.current = key;
      setQuery(searchQuery ?? "");
      setCategory(currentCategory ?? "");
      fetchNotices(currentPage, searchQuery ?? "", currentCategory ?? "");
    }
  }, [searchQuery, currentCategory, currentPage, fetchNotices]);

  const applyFilters = (nextQ: string, nextCat: string) => {
    setQuery(nextQ);
    setCategory(nextCat);
    syncUrl(nextQ, nextCat);
    fetchNotices(1, nextQ, nextCat);
  };

  const rangeStart = totalCount > 0 ? (page - 1) * 9 + 1 : 0;
  const rangeEnd = Math.min(page * 9, totalCount);

  return (
    <>
      {/* Toolbar: search + category chips (instant, no page reload) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters(query.trim(), category);
          }}
          className="relative w-full max-w-md"
        >
          <span className="sr-only">Search notices</span>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notices…"
            type="search"
            className="h-12 w-full rounded-xl border border-line bg-white pl-10 pr-24 text-[14px] font-semibold text-navy shadow-sm outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/10"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 h-9 rounded-lg bg-navy px-4 text-[12px] font-extrabold text-white transition hover:bg-navy-700"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => applyFilters(query, "")}
            className={cn(
              "rounded-full px-3.5 py-2 text-[11.5px] font-extrabold transition",
              !category ? "bg-blue text-white" : "border border-line bg-white text-navy/65 hover:bg-blue-100"
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => applyFilters(query, c)}
              className={cn(
                "rounded-full px-3.5 py-2 text-[11.5px] font-extrabold transition",
                category === c ? "bg-blue text-white" : "border border-line bg-white text-navy/65 hover:bg-blue-100"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Header + refresh */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy-900">
            {category ? `Category: ${category}` : "All Notices"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {totalCount > 0 ? `Showing ${rangeStart}–${rangeEnd} of ${totalCount} notices` : "No notices found"}
          </p>
        </div>
        <Button
          onClick={() => fetchNotices(page, query, category)}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Icon name="refresh-cw" className={cn("h-4 w-4", isLoading && "animate-spin")} />
          <span>{isLoading ? "Refreshing…" : "Refresh"}</span>
        </Button>
      </div>

      {notices.length === 0 ? (
        <Reveal className="mt-6">
          <div className="flex flex-col items-center gap-5 rounded-[2rem] border-2 border-dashed border-line bg-white/60 px-6 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-cream text-amber">
              <Icon name="megaphone" className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-xl text-navy-900">
                {totalCount > 0 ? "No notices match your search" : "No notices published yet"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-muted">
                {totalCount > 0
                  ? "Try a different keyword or category, or view all notices."
                  : "Announcements will appear here as soon as they are published by the school office."}
              </p>
            </div>
            {totalCount > 0 && (
              <Button onClick={() => applyFilters("", "")} variant="outline" size="sm">
                View all notices
              </Button>
            )}
          </div>
        </Reveal>
      ) : (
        <>
          <RevealGroup className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notices.map((notice) => {
              const date = notice.event_date ?? notice.published_at ?? notice.created_at;
              const d = new Date(date.includes("T") ? date : `${date}T00:00:00`);
              const day = Number.isNaN(d.getTime()) ? "•" : d.getDate();
              const month = Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN", { month: "short" });
              return (
                <RevealItem key={notice.id} className="h-full">
                  <Link
                    href={`/notices/${notice.id}`}
                    className="group flex h-full flex-col rounded-[1.5rem] border border-line bg-white p-5 shadow-[0_16px_40px_-32px_rgba(18,50,92,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-blue/30 hover:shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-cream leading-none">
                        <span className="font-display text-xl font-semibold text-navy-900">{day}</span>
                        <span className="mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-amber">{month}</span>
                      </div>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-extrabold text-blue">
                          {notice.category}
                        </span>
                        {notice.pinned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-extrabold text-[#8a5a00]">
                            <Icon name="pin" className="h-2.5 w-2.5" /> Pinned
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <h2 className="mt-4 text-[17px] leading-snug text-navy-900 transition-colors group-hover:text-blue">
                      {notice.title}
                    </h2>
                    {notice.summary && (
                      <p className="mt-2 line-clamp-3 flex-1 text-[12.5px] leading-relaxed text-muted">{notice.summary}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                      <span className="text-[10.5px] font-bold text-muted">
                        {formatDate(notice.published_at ?? notice.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue">
                        Read
                        <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>

          <Pagination
            page={page}
            pages={totalPagesState}
            basePath="/notices"
            searchParams={{ q: "", category: "" }}
            onPageChange={(p) => fetchNotices(p, query, category)}
          />
        </>
      )}
    </>
  );
}
