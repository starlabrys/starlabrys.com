import Reveal from "./reveal";
import { sectionHeadTitle, shell } from "./ui";
import type { HomeContent } from "@/lib/home-content";

export default function Outcomes({
  outcomes,
}: {
  outcomes: HomeContent["outcomes"];
}) {
  return (
    <section id="outcomes" className="bg-home-paper py-[5.5rem]">
      <div className={shell}>
        <Reveal className="mb-12 max-w-[36rem]">
          <h2 className={`${sectionHeadTitle} text-home-ink`}>
            {outcomes.title}
          </h2>
          <p className="mt-3 text-[1.05rem] text-home-slate">
            {outcomes.intro}
          </p>
        </Reveal>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {outcomes.items.map((item, i) => (
            <article key={item.title}>
              <Reveal delay={Math.min(i, 2) as 0 | 1 | 2}>
                <h3 className="font-display text-[1.1rem] font-bold text-home-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-home-slate">{item.body}</p>
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
