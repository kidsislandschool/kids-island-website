import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLatestNotices, getNotice } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

// Revalidate every 60 seconds
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const notice = await getNotice(Number(id));
  if (!notice) return { title: "Notice not found" };
  return await buildPageMetadata(`/notices/${notice.id}`, {
    title: notice.title,
    description:
      notice.summary ??
      `A notice from Kids Island Senior Secondary School, Aligarh${notice.event_date ? ` — ${notice.event_date}` : ""}.`,
  });
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notice = await getNotice(Number(id));
  if (!notice) notFound();
  const more = (await getLatestNotices(4)).filter((n) => n.id !== notice.id).slice(0, 3);
  const bodyParagraphs = (notice.body ?? "").split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <PageHero
        tone="cream"
        breadcrumb="Notices"
        eyebrow={notice.category}
        title={notice.title}
        intro={notice.summary ?? undefined}
      >
        <div className="flex flex-wrap items-center gap-2.5 text-[11.5px] font-bold text-muted">
          <Badge tone="blue" icon={<Icon name="calendar" className="h-3.5 w-3.5" />}>
            {formatDate(notice.published_at ?? notice.created_at)}
          </Badge>
          {notice.pinned ? <Badge tone="yellow">Pinned notice</Badge> : null}
          <Link href="/notices" className="inline-flex items-center gap-1 text-blue hover:underline">
            <Icon name="chevron-left" className="h-3.5 w-3.5" /> All notices
          </Link>
        </div>
      </PageHero>

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.5fr_0.8fr] lg:items-start">
          <Reveal>
            <article className="rounded-[2rem] border border-line bg-white p-6 shadow-soft sm:p-9">
              {notice.event_date && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow text-navy-900">
                    <Icon name="calendar" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">Event date</p>
                    <p className="text-[13.5px] font-extrabold text-navy-900">{formatDate(notice.event_date)}</p>
                  </div>
                </div>
              )}

              {bodyParagraphs.length > 0 ? (
                <div className="space-y-4 text-[15px] leading-relaxed text-navy/75">
                  {bodyParagraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-[15px] leading-relaxed text-navy/75">
                  Please contact the school office for full details about this notice.
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                <Link href="/notices" className="inline-flex items-center gap-1.5 text-[12.5px] font-extrabold text-blue">
                  <Icon name="chevron-left" className="h-4 w-4" /> Back to all notices
                </Link>
                <Button href="/contact" variant="outline" size="sm">
                  Ask a question
                </Button>
              </div>
            </article>
          </Reveal>

          <aside className="flex flex-col gap-4">
            <Reveal direction="right">
              <div className="rounded-[1.75rem] bg-navy p-6 text-white">
                <h2 className="text-lg text-white">More from the notice board</h2>
                {more.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {more.map((item) => (
                      <li key={item.id}>
                        <Link href={`/notices/${item.id}`} className="group block rounded-xl bg-white/5 px-3.5 py-3 transition hover:bg-white/10">
                          <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-yellow">{item.category}</span>
                          <p className="mt-1 text-[12.5px] font-bold leading-snug text-white/85 group-hover:text-white">{item.title}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[12.5px] font-semibold text-white/55">
                    This is the only published notice right now.
                  </p>
                )}
              </div>
            </Reveal>
            <Reveal direction="right" delay={0.05}>
              <div className="rounded-[1.75rem] border border-line bg-white p-6">
                <h2 className="text-lg text-navy-900">Need to visit?</h2>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  The school office is open on working days. Call ahead so the team can help you.
                </p>
                <Button href="/contact#visit" variant="outline" size="sm" className="mt-4">
                  Plan a campus visit
                </Button>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
