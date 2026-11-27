import Image from "next/image";
import { SceneArt, type SceneVariant } from "./scene-art";
import { cn } from "@/lib/utils";

/**
 * Renders a CMS-managed image when one exists, otherwise falls back to a
 * designed SVG scene so no slot on the site is ever an empty grey box.
 * Uses Next.js Image with fill for automatic layout shift prevention.
 */
export function CmsImage({
  src,
  alt,
  variant = "generic",
  className,
  imgClassName,
  priority = false,
  width,
  height,
}: {
  src?: string | null;
  alt: string;
  variant?: SceneVariant | string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Explicit width for layout shift prevention (required if not using fill). */
  width?: number;
  /** Explicit height for layout shift prevention (required if not using fill). */
  height?: number;
}) {
  // Supabase Storage URLs are already WebP (converted on upload)
  // Use fill when no explicit dimensions provided
  const useFill = !width || !height;

  return (
    <div className={cn("relative overflow-hidden bg-paper-2", className)}>
      {src ? (
        useFill ? (
          <div style={{ aspectRatio: "4 / 3" }}>
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn("object-cover", imgClassName)}
              quality={85}
            />
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn("object-cover", imgClassName)}
            quality={85}
          />
        )
      ) : (
        <SceneArt variant={variant} label={alt} className={cn("h-full w-full", className)} />
      )}
    </div>
  );
}
