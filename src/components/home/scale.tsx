import Reveal from "./reveal";
import { sectionHeadTitle, shell } from "./ui";
import type { HomeContent } from "@/lib/home-content";

export default function Scale({ scale }: { scale: HomeContent["scale"] }) {
  return (
    <section className="bg-[#0e1b1d] py-[5.5rem] text-home-white">
      <div className={shell}>
        <Reveal className="mb-12 max-w-[36rem]">
          <h2 className={sectionHeadTitle}>{scale.title}</h2>
          <p className="mt-3 text-[1.05rem] text-white/80">{scale.intro}</p>
        </Reveal>
        <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {scale.stats.map((stat, i) => (
            <div key={stat.dt}>
              <Reveal delay={Math.min(i, 2) as 0 | 1 | 2}>
                <dt className="font-display text-[1.9rem] font-bold">
                  {stat.dt}
                </dt>
                <dd className="mt-2 max-w-[32ch] text-[1.05rem] leading-relaxed text-white/75">
                  {stat.dd}
                </dd>
              </Reveal>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
