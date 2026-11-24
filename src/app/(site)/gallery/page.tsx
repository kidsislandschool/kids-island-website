import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedAlbums } from "@/lib/data";
import { PageHero } from "@/components/sections/page-hero";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Reveal } from "@/components/motion/reveal";
import { SceneArt } from "@/components/ui/scene-art";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildPageMetadata("/gallery", {
    title: "Campus Gallery",
    description: "Photos from academic and extracurricular life at Kids Island Senior Secondary School.",
  });
}

type GalleryPage = { title: string; intro: string; emptyState: string };

export default function GalleryPage() {
  const content = getContent<GalleryPage>("gallery.page", {
    title: "Campus Gallery",
    intro: "A glimpse into the vibrant academic and extracurricular life at Kids Island.",
    emptyState: "Gallery coming soon. Photos from campus life will appear here once published.",
  });
  const albums = getPublishedAlbums().filter((album) => album.photos.length > 0);
  const totalPhotos = albums.reduce((sum, album) => sum + album.photos.length, 0);

  return (
    <>
      <PageHero
        tone="cream"
        breadcrumb="Gallery"
        eyebrow="Campus life"
        title={<>Little moments. <span className="wave-underline">Big memories.</span></>}
        intro={content.intro}
      >
        {totalPhotos > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[11.5px] font-extrabold text-navy shadow-sm">
            <Icon name="camera" className="h-4 w-4 text-amber" />
            {totalPhotos} photo{totalPhotos === 1 ? "" : "s"} across {albums.length} album{albums.length === 1 ? "" : "s"}
          </span>
        )}
      </PageHero>

      <section className="relative bg-paper py-16 sm:py-20" aria-label="Photo galleries">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {albums.length === 0 ? (
            <Reveal>
              <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-line bg-white text-center shadow-soft">
                <div className="relative">
                  <SceneArt variant="art" className="aspect-[16/8] w-full" label="Illustration of school art and creativity" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
                </div>
                <div className="px-6 pb-10 pt-2 sm:px-10">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cream text-amber">
                    <Icon name="camera" className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.1rem)] text-navy-900">Photos are being collected</h2>
                  <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">{content.emptyState}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button href="/contact" variant="navy">
                      Ask about campus life
                    </Button>
                    <Button href="/notices" variant="outline">
                      Notices & events
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
          ) : (
            <GalleryGrid albums={albums} />
          )}
        </div>
      </section>
    </>
  );
}
