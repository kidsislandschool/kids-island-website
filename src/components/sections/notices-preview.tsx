import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { PublicNotice } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export function NoticesPreview({ notices }: { notices: PublicNotice[] }) {
  return (
    <section className="relative bg-paper py-20 sm:py-24" aria-labelledby="notices-preview">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow="Notices & updates"
              eyebrowTone="mint"
              title="What's happening at school"
              text="Announcements, events and important dates — published here by the school office."
              className="[&_h2]:max-w-xl"
            />
            <Button href="/notices" variant="outline" className="group/btn hidden md:inline-flex">
              All notices
              <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </Reveal>

        {notices.length === 0 ? (
          <Reveal className="mt-10">
            <div className="flex flex-col items-center gap-5 rounded-[2rem] border-2 border-dashed border-line bg-white/60 px-6 py-14 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-3xl bg-cream text-amber">
                <Icon name="megaphone" className="h-7 w-7" />
              </span>
              <div>
                <h3 className="text-xl text-navy-900">No announcements yet</h3>
                <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
                  Notices and event updates will appear here as soon as they are published by the school office.
                </p>
              </div>
              <Button href="/notices" variant="outline" size="sm">
                Visit the notices page
              </Button>
            </div>
          </Reveal>
        ) : (
          <RevealGroup className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notices.map((notice) => (
              <RevealItem key={notice.id}>
                <Link
                  href={`/notices/${notice.id}`}
                  className="group flex h-full flex-col rounded-[1.5rem] border border-line bg-white p-6 shadow-[0_16px_40px_-32px_rgba(18,50,92,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-blue/30 hover:shadow-soft"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-blue">
                      {notice.category}
                    </span>
                    <span className="text-[11px] font-bold text-muted">
                      {formatDate(notice.published_at ?? notice.created_at)}
                    </span>
                  </div>
                  {notice.pinned ? (
                    <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-extrabold text-[#8a5a00]">
                      <Icon name="pin" className="h-2.5 w-2.5" /> Pinned
                    </span>
                  ) : null}
                  <h3 className="mt-3 text-[18px] leading-snug text-navy-900 transition-colors group-hover:text-blue">
                    {notice.title}
                  </h3>
                  {notice.summary && (
                    <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted">
                      {notice.summary}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-extrabold text-blue">
                    Read notice
                    <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
}
