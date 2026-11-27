import { cn } from "@/lib/utils";

/** Cloud-shaped section boundary. Place between sections with matching fills. */
export function CloudDivider({
  fill = "#0d2e1e",
  flip = false,
  className,
}: {
  fill?: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none w-full leading-[0]", flip && "rotate-180", className)}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-[48px] w-full sm:h-[72px] lg:h-[96px]"
        role="presentation"
      >
        <path
          fill={fill}
          d="M0,66 C58,66 58,28 116,28 C174,28 174,64 232,64 C290,64 290,16 348,16 C406,16 406,74 464,74 C522,74 522,38 580,38 C638,38 638,86 696,86 C754,86 754,26 812,26 C870,26 870,62 928,62 C986,62 986,14 1044,14 C1102,14 1102,52 1160,52 C1218,52 1218,34 1276,34 C1334,34 1334,68 1440,68 L1440,120 L0,120 Z"
        />
      </svg>
    </div>
  );
}

/** Decorative puffy cloud, used floating behind hero/CTA art. */
export function Cloud({
  className,
  fill = "#ffffff",
  opacity = 1,
  ...rest
}: {
  className?: string;
  fill?: string;
  opacity?: number;
  [key: `data-${string}`]: string | number | undefined;
}) {
  return (
    <svg
      viewBox="0 0 220 120"
      aria-hidden
      className={cn("h-auto w-40", className)}
      style={{ opacity }}
      {...rest}
    >
      <path
        fill={fill}
        d="M42 104c-20 0-34-13-34-30 0-15 11-26 25-29 3-22 20-37 43-37 19 0 34 10 41 26 6-4 13-6 21-6 19 0 34 13 37 31 16 2 28 13 28 28 0 16-13 27-31 27H42Z"
      />
    </svg>
  );
}

/** Small star / sparkle accent. */
export function Sparkle({ className, fill = "#FFC53D" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("h-6 w-6", className)} fill={fill}>
      <path d="M12 1.8c.6 3.9 2.7 6 6.6 6.6-3.9.6-6 2.7-6.6 6.6-.6-3.9-2.7-6-6.6-6.6 3.9-.6 6-2.7 6.6-6.6Z" />
      <path d="M19 14.6c.3 2 1.4 3.1 3.4 3.4-2 .3-3.1 1.4-3.4 3.4-.3-2-1.4-3.1-3.4-3.4 2-.3 3.1-1.4 3.4-3.4Z" opacity=".7" />
    </svg>
  );
}
