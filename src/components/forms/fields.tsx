import { cn } from "@/lib/utils";

export const inputClass =
  "min-h-[48px] w-full rounded-xl border border-line bg-white px-4 text-[16px] font-semibold text-navy-900 shadow-sm outline-none transition-colors placeholder:font-medium placeholder:text-muted/50 focus:border-blue focus:ring-4 focus:ring-blue/10";

export const textareaClass =
  "min-h-[140px] w-full resize-y rounded-xl border border-line bg-white px-4 py-4 text-[16px] font-semibold text-navy-900 shadow-sm outline-none transition-colors placeholder:font-medium placeholder:text-muted/50 focus:border-blue focus:ring-4 focus:ring-blue/10";

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[12.5px] font-extrabold text-navy">
        {label}
        {required && <span className="ml-0.5 text-[#E85D75]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] font-semibold text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="text-[11.5px] font-bold text-[#C23B5A]">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormAlert({
  tone = "error",
  children,
}: {
  tone?: "error" | "info";
  children: React.ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-[13px] font-bold",
        tone === "error"
          ? "border-[#F3C6D1] bg-[#FFF1F4] text-[#A32D4B]"
          : "border-[#CBE7D7] bg-[#EFFAF3] text-[#167A4A]"
      )}
    >
      {children}
    </div>
  );
}
