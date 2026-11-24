import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "center",
  tone = "light",
  className,
  eyebrowTone = "yellow",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  text?: React.ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
  className?: string;
  eyebrowTone?: "yellow" | "blue" | "mint" | "pink" | "cream" | "white";
}) {
  const tones = {
    yellow: "bg-yellow-100 text-navy",
    blue: "bg-blue-100 text-blue",
    mint: "bg-mint text-[#167a4a]",
    pink: "bg-blush text-[#b23a6b]",
    cream: "bg-cream text-navy",
    white: "bg-white text-navy",
  } as const;

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em]",
            tones[eyebrowTone]
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "max-w-3xl text-balance text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.07]",
          tone === "dark" ? "text-white" : "text-navy-900"
        )}
      >
        {title}
      </h2>
      {text && (
        <p
          className={cn(
            "max-w-2xl text-[16.5px] leading-relaxed",
            tone === "dark" ? "text-white/75" : "text-muted"
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}
