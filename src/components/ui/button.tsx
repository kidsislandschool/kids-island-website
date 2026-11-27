import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "navy" | "outline" | "white" | "ghost" | "sky";
type Size = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-yellow text-navy-900 shadow-[0_12px_28px_-12px_rgba(255,159,28,0.65)] hover:bg-[#ffd166] hover:shadow-[0_18px_34px_-14px_rgba(255,159,28,0.75)]",
  navy:
    "bg-navy text-white shadow-soft hover:bg-navy-700",
  outline:
    "border-2 border-navy/15 bg-white text-navy hover:border-green/40 hover:bg-green-200/60",
  white:
    "bg-white text-navy shadow-soft hover:bg-cream",
  ghost:
    "text-navy hover:bg-navy/5",
  sky:
    "bg-green-200 text-navy hover:bg-[#a7f3d0]",
};

const SIZES: Record<Size, string> = {
  sm: "h-11 px-3 text-sm gap-1.5 rounded-xl min-w-[44px]", // 44px min height
  md: "h-12 px-5 text-[15px] gap-2 rounded-2xl min-h-[48px]", // 48px min height
  lg: "h-14 px-6 text-base gap-2.5 rounded-2xl min-h-[52px]",
  xl: "h-16 px-8 text-lg gap-3 rounded-2xl min-h-[56px]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  full?: boolean;
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  full,
  ...rest
}: CommonProps &
  (
    | ({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  )) {
  const classes = cn(
    "inline-flex items-center justify-center font-bold tracking-tight transition-[transform,background-color,box-shadow,border-color] duration-200 ease-out active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60",
    "min-h-[44px] min-w-[44px]", // Minimum touch target
    "flex items-center justify-center",
    VARIANTS[variant],
    SIZES[size],
    full && "w-full",
    className
  );

  if (href) {
    const anchorProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    const external = /^(https?:|mailto:|tel:)/.test(href);
    if (external || href.startsWith("#")) {
      return (
        <a href={href} className={classes} {...anchorProps}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

export function ButtonArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("h-[18px] w-[18px] transition-transform duration-300 group-hover/btn:translate-x-1", className)}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
