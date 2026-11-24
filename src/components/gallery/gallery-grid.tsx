"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PublicAlbum } from "@/lib/data";
import { Icon } from "@/components/ui/icon";
import { DURATION, EASE } from "@/lib/motion";

type FlatPhoto = { url: string; caption: string | null; alt: string; album: string };

export function GalleryGrid({ albums }: { albums: PublicAlbum[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const photos: FlatPhoto[] = albums.flatMap((album) =>
    album.photos.map((photo) => ({
      url: photo.url,
      caption: photo.caption,
      alt: photo.alt,
      album: album.title,
    }))
  );

  const close = useCallback(() => setActive(null), []);
  const next = useCallback(
    () => setActive((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length]
  );
  const prev = useCallback(
    () => setActive((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, next, prev]);

  let flatIndex = -1;

  return (
    <>
      <div className="flex flex-col gap-16">
        {albums.map((album) => (
          <section key={album.id} aria-label={album.title}>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-[clamp(1.4rem,2.5vw,1.9rem)] text-navy-900">{album.title}</h2>
                {album.description && (
                  <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-muted">{album.description}</p>
                )}
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-muted shadow-sm">
                {album.photos.length} photo{album.photos.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {album.photos.map((photo) => {
                flatIndex += 1;
                const index = flatIndex;
                return (
                  <motion.button
                    key={photo.id}
                    type="button"
                    onClick={() => setActive(index)}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                    transition={{ duration: DURATION.md, ease: EASE.out, delay: (index % 4) * 0.04 }}
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream text-left"
                    aria-label={`Open photo: ${photo.alt}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-navy-900/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {photo.caption && (
                      <span className="absolute inset-x-3 bottom-2.5 translate-y-2 text-[11.5px] font-bold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {photo.caption}
                      </span>
                    )}
                    <span className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-navy opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                      <Icon name="image" className="h-3.5 w-3.5" />
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && photos[active] && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : DURATION.sm, ease: EASE.out }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-900/90 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close photo viewer"
              className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <Icon name="close" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
            >
              <Icon name="chevron-left" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
            >
              <Icon name="chevron-right" />
            </button>

            <motion.figure
              key={photos[active].url}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: DURATION.md, ease: EASE.out }}
              className="max-h-full w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[active].url}
                alt={photos[active].alt}
                className="mx-auto max-h-[78svh] w-auto rounded-2xl object-contain"
              />
              <figcaption className="mt-3 text-center">
                {photos[active].caption && <p className="text-[14px] font-bold text-white">{photos[active].caption}</p>}
                <p className="mt-0.5 text-[11.5px] font-semibold text-white/50">
                  {photos[active].album} · {active + 1} / {photos.length}
                </p>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
