import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type Highlight = { title: string; text: string; icon: string };

const ICONS: Record<string, IconName> = {
  book: "book",
  sparkle: "sparkle",
  teacher: "graduation",
  shield: "shield",
};

const TONES = [
  "bg-blue-100 text-blue",
  "bg-blush text-[#b23a6b]",
  "bg-mint text-[#167a4a]",
  "bg-yellow-100 text-[#8a5a00]",
];

export function TrustRow({ items }: { items: Highlight[] }) {
  if (!items.length) return null;
  return (
    <section className="relative z-20 -mt-8 sm:-mt-10" aria-label="Why families trust Kids Island">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealGroup className="grid overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[0_30px_60px_-35px_rgba(18,50,92,0.35)] sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <RevealItem
              key={item.title}
              className={cn(
                "group relative flex gap-3.5 p-5 transition-colors hover:bg-paper-2 sm:p-6",
                i > 0 && "border-t border-line sm:border-t-0 lg:border-l",
                i === 1 && "sm:border-l-0 lg:border-l",
                i === 2 && "sm:border-t lg:border-t-0",
                i === 3 && "sm:border-l"
              )}
            >
              <span
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3",
                  TONES[i % TONES.length]
                )}
              >
                <Icon name={ICONS[item.icon] ?? "sparkle"} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[15.5px] leading-snug text-navy-900">{item.title}</h3>
                <p className="mt-1 text-[12.5px] leading-snug text-muted">{item.text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
