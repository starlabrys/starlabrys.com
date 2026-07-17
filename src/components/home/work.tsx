import Reveal from "./reveal";
import { eyebrow, sectionHeadTitle, shell } from "./ui";
import type { HomeContent } from "@/lib/home-content";

const MEDIA_GRADIENTS = [
  "from-home-teal to-home-teal-deep",
  "from-[#3d4f54] to-[#0e1618]",
  "from-home-teal-soft to-home-mist",
];

export default function Work({ work }: { work: HomeContent["work"] }) {
  return (
    <section id="work" className="bg-home-white py-[5.5rem]">
      <div className={shell}>
        <Reveal className="mb-12 max-w-[36rem]">
          <h2 className={`${sectionHeadTitle} text-home-ink`}>
            {work.title}
          </h2>
          <p className="mt-3 text-[1.05rem] text-home-slate">{work.intro}</p>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-3">
          {work.stories.map((story, i) => (
            <article key={story.title} className="group">
              <Reveal delay={Math.min(i, 2) as 0 | 1 | 2}>
                <div
                  aria-hidden="true"
                  className={`mb-4 aspect-[4/3] rounded-sm bg-gradient-to-br ${MEDIA_GRADIENTS[i % MEDIA_GRADIENTS.length]} transition-transform duration-300 group-hover:scale-[1.02]`}
                />
                {story.eyebrow ? (
                  <span className={eyebrow}>{story.eyebrow}</span>
                ) : null}
                <h3 className="font-display text-[1.1rem] font-bold text-home-ink">
                  {story.title}
                </h3>
                <p className="mt-2 text-home-slate">{story.body}</p>
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
