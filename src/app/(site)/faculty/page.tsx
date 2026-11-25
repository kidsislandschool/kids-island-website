import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedFaculty } from "@/lib/data";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CmsImage } from "@/components/ui/cms-image";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SceneArt } from "@/components/ui/scene-art";

// Revalidate every 60 seconds
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return await buildPageMetadata("/faculty", {
    title: "Our Faculty",
    description: "Meet the educators at Kids Island Senior Secondary School, Aligarh.",
  });
}

type FacultyPage = { heading: string; intro: string; emptyState: string };

export default async function FacultyPage() {
  const [content, faculty] = await Promise.all([
    getContent<FacultyPage>("faculty.page", {
      heading: "Meet our faculty",
      intro: "Experienced educators committed to nurturing excellence, fostering curiosity, and inspiring the next generation of leaders.",
      emptyState: "Faculty profiles are being prepared. They will appear here once published by the school.",
    }),
    getPublishedFaculty(),
  ]);

  return (
    <>
      <PageHero
        tone="blush"
        breadcrumb="Faculty"
        eyebrow="Our people"
        title={<>Meet our <span className="wave-underline">faculty</span></>}
        intro={content.intro}
      />

      <section className="relative bg-paper py-20 sm:py-24" aria-label="Faculty members">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {faculty.length === 0 ? (
            <Reveal>
              <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] border border-line bg-white p-6 shadow-soft sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="order-2 lg:order-1">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blush text-[#b23a6b]">
                    <Icon name="user-group" className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.1rem)] leading-tight text-navy-900">
                    Profiles are on their way
                  </h2>
                  <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-muted">{content.emptyState}</p>
                  <p className="mt-6 rounded-xl bg-paper-2 px-4 py-3 text-[12px] font-semibold leading-relaxed text-navy/60">
                    The school office publishes each profile only after the teacher has approved their details and
                    photograph.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href="/contact" variant="navy">
                      Contact the school
                    </Button>
                    <Button href="/about" variant="outline">
                      About Kids Island
                    </Button>
                  </div>
                </div>
                <div className="relative order-1 overflow-hidden rounded-[1.6rem] lg:order-2">
                  <SceneArt variant="classroom" className="aspect-[4/3] w-full" label="Illustration of a Kids Island classroom" />
                  <div className="absolute bottom-4 left-4">
                    <Badge tone="white" icon={<Icon name="graduation" className="h-3.5 w-3.5" />}>
                      Teaching with care
                    </Badge>
                  </div>
                </div>
              </div>
            </Reveal>
          ) : (
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {faculty.map((member) => (
                <RevealItem key={member.id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-[0_16px_40px_-32px_rgba(18,50,92,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
                    <div className="relative aspect-[4/3.6] overflow-hidden bg-cream">
                      {member.photo ? (
                        <CmsImage
                          src={member.photo}
                          alt={`${member.name}, ${member.designation ?? "faculty member"}`}
                          variant="classroom"
                          className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-[linear-gradient(160deg,#FFF3D6,#E3F8EA)]">
                          <span className="font-display text-6xl font-semibold text-navy/25">
                            {member.name
                              .split(" ")
                              .slice(0, 2)
                              .map((w) => w[0])
                              .join("")}
                          </span>
                        </div>
                      )}
                      {member.featured ? (
                        <span className="absolute right-3 top-3 rounded-full bg-yellow px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-navy-900">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="text-[17px] text-navy-900">{member.name}</h2>
                      {member.designation && (
                        <p className="text-[11.5px] font-extrabold uppercase tracking-[0.08em] text-blue">
                          {member.designation}
                        </p>
                      )}
                      {member.subjects && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {member.subjects.split(",").map((subject) => (
                            <span key={subject} className="rounded-full bg-paper-2 px-2.5 py-1 text-[10.5px] font-bold text-navy/65">
                              {subject.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {member.bio && <p className="mt-3 line-clamp-4 text-[12.5px] leading-relaxed text-muted">{member.bio}</p>}
                      {member.qualification && (
                        <p className="mt-auto flex items-center gap-1.5 pt-4 text-[11px] font-bold text-muted">
                          <Icon name="graduation" className="h-3.5 w-3.5 text-amber" />
                          {member.qualification}
                        </p>
                      )}
                    </div>
                  </article>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>
    </>
  );
}
