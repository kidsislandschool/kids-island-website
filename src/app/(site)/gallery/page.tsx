import type { Metadata } from "next";
import { getContent, getSiteSettings } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedAlbums } from "@/lib/data";
import { PageHero } from "@/components/sections/page-hero";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Reveal } from "@/components/motion/reveal";
import { SceneArt } from "@/components/ui/scene-art";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

// Revalidate every 60 seconds
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return await buildPageMetadata("/gallery", {
    title: "Campus Gallery",
    description: "Photos from academic and extracurricular life at Kids Island Senior Secondary School.",
  });
}

type GalleryPage = { title: string; intro: string; emptyState: string };

export default async function GalleryPage() {
  const [content, albumsData, site] = await Promise.all([
    getContent<GalleryPage>("gallery.page", {
      title: "Campus Gallery",
      intro: "A glimpse into the vibrant academic and extracurricular life at Kids Island.",
      emptyState: "Gallery coming soon. Photos from campus life will appear here once published.",
    }),
    getPublishedAlbums(),
    getSiteSettings(),
  ]);
  const albums = albumsData.filter((album) => album.photos.length > 0);
  const totalPhotos = albums.reduce((sum, album) => sum + album.photos.length, 0);

  const youtubeUrl = site.socials.find((s) => s.label.toLowerCase().includes("you"))?.url ?? "https://youtube.com/@kidsislandaligarh";

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

      {/* YouTube CTA */}
      <Reveal delay={0.15} className="mx-auto max-w-7xl px-5 sm:px-8 pb-8">
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-5 py-4 shadow-[0_10px_30px_-24px_rgba(18,50,92,0.35)] backdrop-blur transition hover:border-blue/25 hover:shadow-soft hover:bg-blue-50"
          aria-label="Visit our YouTube channel for more videos"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-600 text-white transition group-hover:scale-105">
            <Icon name="youtube" className="h-5 w-5" />
          </span>
          <div className="text-left">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-navy/50">Watch more</p>
            <p className="text-[16px] font-display font-semibold text-navy-900">For more, go to our YouTube</p>
          </div>
          <Icon name="arrow-up-right" className="h-5 w-5 text-navy/30 group-hover:text-blue transition-colors" />
        </a>
      </Reveal>

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
