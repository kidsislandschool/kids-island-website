"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { inputClass } from "@/components/forms/fields";

export function MaterialFilters({
  classLevels,
  subjects,
  onFilterChange,
}: {
  classLevels: string[];
  subjects: string[];
  /** When provided, filters update client-side instantly (no page navigation). */
  onFilterChange?: (next: { q?: string; classLevel?: string; subject?: string }) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const clientMode = Boolean(onFilterChange);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [localClass, setLocalClass] = useState(params.get("classLevel") ?? "");
  const [localSubject, setLocalSubject] = useState(params.get("subject") ?? "");

  const classLevel = clientMode ? localClass : (params.get("classLevel") ?? "");
  const subject = clientMode ? localSubject : (params.get("subject") ?? "");

  function push(next: URLSearchParams) {
    next.delete("page");
    if (onFilterChange) {
      onFilterChange({
        q: next.get("q") ?? undefined,
        classLevel: next.get("classLevel") ?? undefined,
        subject: next.get("subject") ?? undefined,
      });
      return;
    }
    const qs = next.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function setParam(key: string, value: string) {
    if (clientMode) {
      if (key === "classLevel") setLocalClass(value);
      if (key === "subject") setLocalSubject(value);
      if (key === "q") setQuery(value);
      push(
        new URLSearchParams({
          q: key === "q" ? value : query,
          classLevel: key === "classLevel" ? value : localClass,
          subject: key === "subject" ? value : localSubject,
        })
      );
      return;
    }
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    push(next);
  }

  const hasFilters = Boolean(
    clientMode ? query || localClass || localSubject : params.get("q") || params.get("classLevel") || params.get("subject")
  );

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
            value={classLevel}
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
            value={subject}
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
            setLocalClass("");
            setLocalSubject("");
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
