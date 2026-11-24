"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { inputClass } from "@/components/forms/fields";

export function MaterialFilters({
  classLevels,
  subjects,
}: {
  classLevels: string[];
  subjects: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  function push(next: URLSearchParams) {
    next.delete("page");
    const qs = next.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    push(next);
  }

  const hasFilters = Boolean(params.get("q") || params.get("classLevel") || params.get("subject"));

  return (
    <div className="rounded-[1.5rem] border border-line bg-white p-4 shadow-soft sm:p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam("q", query.trim());
        }}
        className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto]"
      >
        <label className="relative block">
          <span className="sr-only">Search study materials</span>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, assignments, topics…"
            className={`${inputClass} pl-10`}
            type="search"
          />
        </label>

        <label>
          <span className="sr-only">Filter by class</span>
          <select
            value={params.get("classLevel") ?? ""}
            onChange={(e) => setParam("classLevel", e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">All classes</option>
            {classLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Filter by subject</span>
          <select
            value={params.get("subject") ?? ""}
            onChange={(e) => setParam("subject", e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-navy px-5 text-[13.5px] font-extrabold text-white transition hover:bg-navy-700"
        >
          <Icon name="search" className="h-4 w-4" />
          Filter
        </button>
      </form>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            push(new URLSearchParams());
          }}
          className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-extrabold text-muted transition hover:text-navy"
        >
          <Icon name="close" className="h-3 w-3" /> Clear all filters
        </button>
      )}
    </div>
  );
}
