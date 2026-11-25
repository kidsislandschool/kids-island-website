import { cn } from "@/lib/utils";

type Tone = "yellow" | "blue" | "mint" | "pink" | "cream" | "white" | "navy";

const TONES: Record<Tone, string> = {
  yellow: "bg-yellow-100 text-navy border-yellow/40",
  blue: "bg-green-200 text-blue hover:bg-[#a7f3d0]",
  mint: "bg-mint text-[#167a4a]",
  pink: "bg-blush text-[#b23a6b]",
  cream: "bg-cream text-navy",
  white: "bg-white/80 text-navy border-white/60 backdrop-blur",
  navy: "bg-navy text-white",
};

export function Badge({
  children,
  tone = "yellow",
  className,
  icon,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-transparent px-3.5 py-1.5 text-[13px] font-bold tracking-tight",
        TONES[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
