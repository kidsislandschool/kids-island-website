import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------ page chrome */

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-blue">{eyebrow}</p>
        )}
        <h1 className="mt-1.5 font-display text-[clamp(1.7rem,3.2vw,2.35rem)] font-semibold leading-tight tracking-tight text-navy-900">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function AdminCard({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag className={cn("rounded-2xl border border-line bg-white shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)]", className)}>
      {children}
    </Tag>
  );
}

export function AdminCardHeader({
  title,
  description,
  action,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div>
        <h2 className="font-display text-[16.5px] font-semibold text-navy-900">{title}</h2>
        {description && <p className="mt-1 text-[12px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* --------------------------------------------------------------- statuses */

const STATUS_TONES: Record<string, string> = {
  published: "bg-[#EAF9F1] text-[#167A4A] border-[#CBE7D7]",
  draft: "bg-paper-2 text-[#5B6B85] border-line",
  needs_review: "bg-[#FFF6E3] text-[#9A5B00] border-[#F2DDB0]",
  new: "bg-green-200 text-blue",
  read: "bg-paper-2 text-[#5B6B85]",
  replied: "bg-[#EAF9F1] text-[#167A4A]",
  closed: "bg-[#FDF0F3] text-[#A32D4B]",
  missing: "bg-[#FDF0F3] text-[#A32D4B] border-[#F3C6D1]",
};

const STATUS_LABELS: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  needs_review: "Needs review",
  new: "New",
  read: "Read",
  replied: "Replied",
  closed: "Closed",
  missing: "Not in database",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-extrabold",
        STATUS_TONES[status] ?? "bg-paper-2 text-muted border-line",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

/* ------------------------------------------------------------------ cards */

export function AdminStat({
  label,
  value,
  icon,
  href,
  hint,
  tone = "blue",
}: {
  label: string;
  value: number | string;
  icon: IconName;
  href?: string;
  hint?: string;
  tone?: "blue" | "yellow" | "mint" | "pink" | "navy";
}) {
  const tones = {
    blue: "bg-green-200 text-blue",
    yellow: "bg-yellow-100 text-[#8a5a00]",
    mint: "bg-mint text-[#167a4a]",
    pink: "bg-blush text-[#b23a6b]",
    navy: "bg-navy text-yellow",
  } as const;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid h-10 w-10 place-items-center rounded-xl", tones[tone])}>
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
        {href && <Icon name="arrow-up-right" className="h-4 w-4 text-navy/20 transition group-hover:text-blue" />}
      </div>
      <p className="mt-4 font-display text-[2rem] font-semibold leading-none text-navy-900">{value}</p>
      <p className="mt-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted">{label}</p>
      {hint && <p className="mt-1 text-[11px] font-semibold text-muted/80">{hint}</p>}
    </>
  );

  return (
    <AdminCard className="group h-full p-5 transition hover:-translate-y-0.5 hover:border-blue/25 hover:shadow-soft">
      {href ? (
        <Link href={href} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </AdminCard>
  );
}

export function EmptyState({
  icon = "file",
  title,
  text,
  children,
}: {
  icon?: IconName;
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cream text-amber">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{title}</h3>
      {text && <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">{text}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

/* ----------------------------------------------------------- form labels */

export const adminInput =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-[13px] font-semibold text-navy-900 outline-none transition placeholder:font-medium placeholder:text-muted/50 focus:border-blue focus:ring-4 focus:ring-blue/10";

export const adminTextarea =
  "min-h-[96px] w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] font-semibold leading-relaxed text-navy-900 outline-none transition placeholder:font-medium placeholder:text-muted/50 focus:border-blue focus:ring-4 focus:ring-blue/10";

export const adminSelect =
  "h-10 w-full appearance-none rounded-lg border border-line bg-white px-3 pr-9 text-[13px] font-semibold text-navy-900 outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/10";

export function AdminField({
  label,
  htmlFor,
  required,
  help,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-1 text-[11.5px] font-extrabold text-navy">
        {label}
        {required && <span className="text-[#E85D75]">*</span>}
      </label>
      {children}
      {help && <p className="text-[10.5px] font-semibold leading-snug text-muted">{help}</p>}
      {error && <p className="text-[10.5px] font-bold text-[#C23B5A]">{error}</p>}
    </div>
  );
}
