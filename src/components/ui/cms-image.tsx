import { SceneArt, type SceneVariant } from "./scene-art";
import { cn } from "@/lib/utils";

/**
 * Renders a CMS-managed image when one exists, otherwise falls back to a
 * designed SVG scene so no slot on the site is ever an empty grey box.
 */
export function CmsImage({
  src,
  alt,
  variant = "generic",
  className,
  imgClassName,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  variant?: SceneVariant | string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-paper-2", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- CMS uploads can be arbitrary sizes/formats.
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : (
        <SceneArt variant={variant} label={alt} />
      )}
    </div>
  );
}
