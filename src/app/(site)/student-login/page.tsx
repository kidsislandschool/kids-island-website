import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { SceneArt } from "@/components/ui/scene-art";

export async function generateMetadata(): Promise<Metadata> {
  return await buildPageMetadata(
    "/student-login",
    {
      title: "Student Login",
      description: "The student portal for Kids Island Senior Secondary School is coming soon.",
    },
    { noIndex: true }
  );
}

export default function StudentLoginPage() {
  return (
    <>
      <PageHero
        tone="mint"
        breadcrumb="Student Login"
        eyebrow="Student portal"
        title={<>The student portal is <span className="wave-underline">coming soon</span></>}
        intro="We're building a simple, safe space for students to access their learning resources. It isn't live yet — here is what you can use today."
      />

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-stretch gap-6 px-5 sm:px-8 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <div className="flex h-full flex-col rounded-[2rem] bg-navy p-7 text-white sm:p-9">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-yellow">
                <Icon name="lock" className="h-5 w-5" />
              </span>
              <h2 className="mt-6 text-2xl text-white">No login needed — yet</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-white/60">
                Student accounts are part of a later phase. When the portal launches, the school will share login
                details directly with students and parents. There are no default or shared passwords.
              </p>
              <ul className="mt-6 space-y-3 text-[13px] font-semibold text-white/70">
                {[
                  "Study notes and resources are already available publicly.",
                  "Notices and events are posted on the notice board.",
                  "For anything urgent, contact the school office.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Icon name="check-circle" className="mt-0.5 h-4 w-4 shrink-0 text-yellow" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <Button href="/study-materials" variant="primary" size="sm">
                  Browse study materials
                </Button>
                <Button href="/notices" variant="outline" size="sm" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  View notices
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.08}>
            <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-line bg-white shadow-soft">
              <SceneArt variant="library" className="aspect-[16/9] w-full" label="Illustration of a student reading in the library" />
              <div className="flex flex-1 flex-col p-7">
                <h2 className="text-xl text-navy-900">Have a question about access?</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                  Reach out to the school office and the team will help you with materials, notices or anything else
                  your child needs.
                </p>
                <div className="mt-auto pt-5">
                  <Button href="/contact" variant="outline" className="group/btn">
                    Contact the school
                    <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
