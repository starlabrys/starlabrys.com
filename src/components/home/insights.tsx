import Reveal from "./reveal";
import { sectionHeadTitle, shell } from "./ui";
import type { HomeContent } from "@/lib/home-content";

export default function Insights({
  insights,
}: {
  insights: HomeContent["insights"];
}) {
  return (
    <section id="insights" className="bg-home-paper py-[5.5rem]">
      <div className={shell}>
        <Reveal className="mb-12 max-w-[36rem]">
          <h2 className={`${sectionHeadTitle} text-home-ink`}>
            {insights.title}
          </h2>
          <p className="mt-3 text-[1.05rem] text-home-slate">
            {insights.intro}
          </p>
        </Reveal>
        <ul className="divide-y divide-home-line border-t border-b border-home-line">
          {insights.items.map((item, i) => (
            <li key={item.title}>
              <Reveal
                delay={Math.min(i, 2) as 0 | 1 | 2}
                className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:gap-6"
              >
                <span className="inline-flex w-fit rounded-sm bg-home-teal-soft px-2 py-1 text-[0.75rem] font-semibold text-home-teal-deep">
                  {item.tag}
                </span>
                <a href="#contact" className="group">
                  <h3 className="font-display text-[1.05rem] font-semibold text-home-ink transition-colors group-hover:text-home-teal">
                    {item.title}
                  </h3>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
