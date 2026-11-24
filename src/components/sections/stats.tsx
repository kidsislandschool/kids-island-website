import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { Icon } from "@/components/ui/icon";

export type Stat = { value: number; suffix?: string; label: string };

export function StatsBand({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <section className="relative overflow-hidden bg-cream py-16 sm:py-20" aria-label="School at a glance">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="dot-grid absolute inset-0 text-navy/[0.04]" />
        <div className="absolute left-1/2 top-0 h-40 w-[42rem] -translate-x-1/2 rounded-full bg-yellow/20 blur-[70px]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-navy shadow-sm">
            <Icon name="star" className="h-3.5 w-3.5 text-amber" /> Kids Island at a glance
          </span>
        </Reveal>
        <RevealGroup className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <RevealItem key={stat.label} className="text-center">
              <div className="group relative rounded-[1.75rem] border border-white bg-white/70 px-4 py-7 shadow-[0_18px_40px_-30px_rgba(18,50,92,0.35)] backdrop-blur transition-transform duration-300 hover:-translate-y-1 sm:px-5">
                <div className="font-display text-[clamp(2.1rem,4vw,2.9rem)] font-semibold leading-none text-navy-900">
                  <CountUp value={stat.value} suffix={stat.suffix ?? ""} />
                </div>
                <p className="mt-3 text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
                  {stat.label}
                </p>
                <span className="absolute inset-x-8 bottom-0 h-[3px] origin-center scale-x-0 rounded-full bg-yellow transition-transform duration-300 group-hover:scale-x-100" />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
