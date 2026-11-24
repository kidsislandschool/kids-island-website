import { cn } from "@/lib/utils";

/** Custom Kids Island mark: a sunny little island inside a rounded tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("h-11 w-11", className)}>
      <defs>
        <linearGradient id="ki-logo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8FC5FF" />
          <stop offset="100%" stopColor="#2F6FED" />
        </linearGradient>
        <linearGradient id="ki-logo-island" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8FE3B8" />
          <stop offset="100%" stopColor="#4FBF7B" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="20" fill="url(#ki-logo-sky)" />
      <circle cx="45" cy="19" r="10" fill="#FFC53D" />
      <circle cx="45" cy="19" r="14" fill="#FFC53D" opacity=".25" />
      <path d="M0 43c9-6 18-6 27 0s19 6 37 0v21H0Z" fill="#8FC5FF" opacity=".55" />
      <path d="M0 49c10-5 19-5 28 1s20 6 36-1v15H0Z" fill="#fff" opacity=".28" />
      <path d="M13 44c4-11 13-16 20-16s15 6 19 16c3 6-2 9-8 9H20c-6 0-9-3-7-9Z" fill="url(#ki-logo-island)" />
      <path d="M25 36c2-6 5-8 8-8 4 0 6 3 8 8" fill="none" stroke="#2C7A4B" strokeWidth="2.4" strokeLinecap="round" opacity=".6" />
      <path d="M22 22c2-4 7-4 9 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".9" />
    </svg>
  );
}

export function Logo({
  light = false,
  compact = false,
  className,
}: {
  light?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={compact ? "h-9 w-9" : "h-11 w-11"} />
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-[19px] font-semibold tracking-tight",
            light ? "text-white" : "text-navy-900",
            compact && "text-[17px]"
          )}
        >
          Kids Island
        </span>
        <span
          className={cn(
            "mt-1 block text-[9.5px] font-extrabold uppercase tracking-[0.16em]",
            light ? "text-white/55" : "text-muted"
          )}
        >
          Senior Secondary School
        </span>
      </span>
    </span>
  );
}
