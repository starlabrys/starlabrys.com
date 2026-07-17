import Reveal from "./reveal";
import { eyebrow, sectionHeadTitle, shell, textLink } from "./ui";
import type { HomeContent } from "@/lib/home-content";

export default function Services({
  services,
}: {
  services: HomeContent["services"];
}) {
  return (
    <section id="services" className="bg-home-white py-[5.5rem]">
      <div className={shell}>
        <Reveal className="mb-12 max-w-[36rem]">
          <h2 className={`${sectionHeadTitle} text-home-ink`}>
            {services.title}
          </h2>
          <p className="mt-3 text-[1.05rem] text-home-slate">
            {services.intro}
          </p>
        </Reveal>

        <Reveal className="mb-16 grid gap-10 rounded-sm border border-home-line bg-home-paper p-8 md:grid-cols-2 md:items-center md:p-12">
          <div>
            <span className={eyebrow}>{services.flagship.eyebrow}</span>
            <h3 className="font-display text-[1.4rem] font-bold text-home-ink">
              {services.flagship.title}
            </h3>
            <p className="mt-3 text-home-slate">{services.flagship.body}</p>
            <a href="#work" className={textLink}>
              {services.flagship.link}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
          <div aria-hidden="true" className="hidden md:block">
            <div className="rounded-sm border border-home-line bg-home-white shadow-sm">
              <div className="flex gap-1.5 border-b border-home-line p-3">
                <span className="h-2 w-2 rounded-full bg-home-line" />
                <span className="h-2 w-2 rounded-full bg-home-line" />
                <span className="h-2 w-2 rounded-full bg-home-line" />
              </div>
              <div className="flex gap-3 p-4">
                <div className="h-32 w-10 rounded-sm bg-home-mist" />
                <div className="flex-1 space-y-3">
                  <div className="h-16 rounded-sm bg-gradient-to-r from-home-teal-soft to-home-mist" />
                  <div className="flex gap-2">
                    <div className="h-8 flex-1 rounded-sm bg-home-mist" />
                    <div className="h-8 flex-1 rounded-sm bg-home-mist" />
                    <div className="h-8 flex-1 rounded-sm bg-home-mist" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <ul id="capabilities" className="grid gap-8 md:grid-cols-3">
          {services.capabilities.map((cap, i) => (
            <li key={cap.title}>
              <Reveal delay={Math.min(i, 2) as 0 | 1 | 2}>
                <h3 className="font-display text-[1.1rem] font-bold text-home-ink">
                  {cap.title}
                </h3>
                <p className="mt-2 text-home-slate">{cap.body}</p>
                <a href="#contact" className={textLink}>
                  {cap.link}
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
