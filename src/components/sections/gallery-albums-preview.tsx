import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CmsImage } from "@/components/ui/cms-image";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPublishedAlbums } from "@/lib/data";

export async function GalleryAlbumsPreview() {
  const albums = await getPublishedAlbums();
  if (!albums.length) return null;

  const displayAlbums = albums.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-cream py-20 sm:py-24" aria-labelledby="gallery-preview-title">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="dot-grid absolute inset-0 text-navy/[0.035]" />
        <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-yellow/15 blur-[80px]" />
        <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-green-200 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow="Campus gallery"
              eyebrowTone="blue"
              title={<>Little moments. <span className="wave-underline">Big memories.</span></>}
              text="Browse our photo albums capturing daily life, events, and achievements at Kids Island."
              className="[&_h2]:max-w-xl"
            />
            <Button href="/gallery" variant="white" className="group/btn hidden md:inline-flex">
              View all albums
              <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayAlbums.map((album, i) => (
            <RevealItem key={album.id} className="h-full">
              <Link
                href={`/gallery`}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_16px_40px_-28px_rgba(18,50,92,0.4)] transition-transform duration-300 hover:-translate-y-1"
                )}
              >
                <div className="relative overflow-hidden bg-paper-2">
                  <CmsImage
                    src={album.cover_photo}
                    alt={album.title}
                    variant="school"
                    imgClassName="h-auto w-full object-contain"
                    className="flex items-center justify-center py-4"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[19px] leading-snug text-navy-900">{album.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {album.description ?? "Photos coming soon"}
                  </p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-8 md:hidden">
          <Button href="/gallery" variant="white" full>
            View all albums
          </Button>
        </Reveal>
      </div>
    </section>
  );
}