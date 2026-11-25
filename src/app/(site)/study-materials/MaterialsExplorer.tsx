"use client";

import { useState, useCallback } from "react";
import { MaterialFilters } from "@/components/forms/material-filters";
import { MaterialList } from "./MaterialList";

interface Material {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  class_level: string;
  subject: string;
  file_type: string | null;
  file_size: number | null;
  published_at: string | null;
  created_at: string;
}

interface MaterialsExplorerProps {
  initialMaterials: Material[];
  classLevels: string[];
  subjects: string[];
  currentPage: number;
  totalPages: number;
  total: number;
  initialQ?: string;
  initialClassLevel?: string;
  initialSubject?: string;
}

/**
 * Owns filter state + fetching so filtering/refetch happens client-side
 * instantly — no slow server navigation.
 */
export function MaterialsExplorer({
  initialMaterials,
  classLevels,
  subjects,
  currentPage,
  totalPages,
  total,
  initialQ,
  initialClassLevel,
  initialSubject,
}: MaterialsExplorerProps) {
  const [filters, setFilters] = useState({
    q: initialQ ?? "",
    classLevel: initialClassLevel ?? "",
    subject: initialSubject ?? "",
  });
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(currentPage);
  const [totalPagesState, setTotalPages] = useState(totalPages);
  const [totalCount, setTotalCount] = useState(total);

  const fetchMaterials = useCallback(async (pageNum: number, f: typeof filters) => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (f.q) params.set("q", f.q);
    if (f.classLevel) params.set("classLevel", f.classLevel);
    if (f.subject) params.set("subject", f.subject);
    params.set("page", String(pageNum));
    params.set("perPage", "9");

    try {
      const res = await fetch(`/api/study-materials?${params.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.rows);
        setTotalPages(data.pages);
        setTotalCount(data.total);
        setPage(data.page);
      }
    } catch (e) {
      console.error("Failed to fetch materials:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFilterChange = useCallback(
    (next: { q?: string; classLevel?: string; subject?: string }) => {
      const f = {
        q: next.q ?? "",
        classLevel: next.classLevel ?? "",
        subject: next.subject ?? "",
      };
      setFilters(f);
      const params = new URLSearchParams();
      if (f.q) params.set("q", f.q);
      if (f.classLevel) params.set("classLevel", f.classLevel);
      if (f.subject) params.set("subject", f.subject);
      const qs = params.toString();
      window.history.replaceState(null, "", `/study-materials${qs ? `?${qs}` : ""}`);
      fetchMaterials(1, f);
    },
    [fetchMaterials]
  );

  return (
    <>
      <MaterialFilters
        classLevels={classLevels}
        subjects={subjects}
        onFilterChange={handleFilterChange}
      />
      <MaterialList
        materials={materials}
        isLoading={isLoading}
        page={page}
        totalPages={totalPagesState}
        total={totalCount}
        onRefresh={() => fetchMaterials(page, filters)}
        onPageChange={(p) => fetchMaterials(p, filters)}
      />
    </>
  );
}
