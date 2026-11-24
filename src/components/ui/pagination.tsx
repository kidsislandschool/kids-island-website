import Link from "next/link";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pages,
  basePath,
  searchParams,
}: {
  page: number;
  pages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (value) params.set(key, value);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  const items: (number | "…")[] = [];
  const push = (v: number | "…") => items.push(v);
  const windowStart = Math.max(1, page - 1);
  const windowEnd = Math.min(pages, page + 1);
  if (windowStart > 1) {
    push(1);
    if (windowStart > 2) push("…");
  }
  for (let i = windowStart; i <= windowEnd; i++) push(i);
  if (windowEnd < pages) {
    if (windowEnd < pages - 1) push("…");
    push(pages);
  }

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          aria-label="Previous page"
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-navy transition hover:bg-cream"
        >
          <Icon name="chevron-left" className="h-4 w-4" />
        </Link>
      ) : (
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-navy/25">
          <Icon name="chevron-left" className="h-4 w-4" />
        </span>
      )}
      {items.map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-sm font-bold text-muted">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-[13px] font-extrabold transition",
              item === page
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-navy hover:bg-cream"
            )}
          >
            {item}
          </Link>
        )
      )}
      {page < pages ? (
        <Link
          href={href(page + 1)}
          aria-label="Next page"
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-navy transition hover:bg-cream"
        >
          <Icon name="chevron-right" className="h-4 w-4" />
        </Link>
      ) : (
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-navy/25">
          <Icon name="chevron-right" className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
