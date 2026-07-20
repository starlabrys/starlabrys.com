"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "./reveal";
import { eyebrow, sectionHeadTitle, shell, textLink } from "./ui";
import type { HomeContent } from "@/lib/home-content";
import type { Locale } from "@/lib/i18n";

const MEDIA_GRADIENTS = [
  "from-home-teal to-home-teal-deep",
  "from-[#3d4f54] to-[#0e1618]",
  "from-home-teal-soft to-home-mist",
];

const UI_LABELS: Record<
  Locale,
  {
    prev: string;
    next: string;
    region: string;
    goTo: (n: number) => string;
    viewDetails: string;
  }
> = {
  zh: {
    prev: "上一项",
    next: "下一项",
    region: "项目案例轮播",
    goTo: (n) => `转到第 ${n} 项`,
    viewDetails: "查看项目详情",
  },
  en: {
    prev: "Previous",
    next: "Next",
    region: "Project carousel",
    goTo: (n) => `Go to project ${n}`,
    viewDetails: "View project details",
  },
};

const AUTO_MS = 5000;

export default function Work({
  work,
  locale,
}: {
  work: HomeContent["work"];
  locale: Locale;
}) {
  const stories = work.stories;
  const labels = UI_LABELS[locale];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useRef(false);

  const count = stories.length;
  const story = stories[index];

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (count <= 1 || paused || reduceMotion.current) return;
    const id = window.setInterval(() => go(index + 1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [count, paused, index, go]);

  if (!story) return null;

  const detailHref = `/${locale}/work/${story.slug}`;

  return (
    <section id="work" className="bg-home-white py-[5.5rem]">
      <div className={shell}>
        <Reveal className="mb-12 max-w-[36rem]">
          <h2 className={`${sectionHeadTitle} text-home-ink`}>
            {work.title}
          </h2>
          <p className="mt-3 text-[1.05rem] text-home-slate">{work.intro}</p>
        </Reveal>

        <Reveal>
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label={labels.region}
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setPaused(false);
              }
            }}
          >
            <article
              aria-live="polite"
              className="grid items-start gap-8 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
            >
              <Link
                href={detailHref}
                aria-label={`${labels.viewDetails}: ${story.title}`}
                className="group relative overflow-hidden rounded-sm border border-home-line bg-home-mist transition-colors hover:border-home-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-teal"
              >
                <div className="relative aspect-[11/5] w-full bg-home-mist">
                  {story.image ? (
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      sizes="(max-width: 768px) 100vw, min(700px, 60vw)"
                      className="object-contain"
                      priority={index === 0}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className={`absolute inset-0 bg-gradient-to-br ${MEDIA_GRADIENTS[index % MEDIA_GRADIENTS.length]}`}
                    />
                  )}
                </div>
                <span className="pointer-events-none absolute right-3 bottom-3 rounded-sm bg-home-ink/70 px-2.5 py-1 text-[0.75rem] font-semibold text-home-white opacity-90 transition-opacity group-hover:opacity-100">
                  {labels.viewDetails}
                </span>
              </Link>

              <div>
                {story.eyebrow ? (
                  <span className={eyebrow}>{story.eyebrow}</span>
                ) : null}
                <p className="mb-2 text-[0.85rem] font-semibold text-home-slate">
                  {index + 1} / {count}
                </p>
                <h3 className="font-display text-[clamp(1.35rem,2.5vw,1.85rem)] font-bold text-home-ink">
                  <Link
                    href={detailHref}
                    className="transition-colors hover:text-home-teal"
                  >
                    {story.title}
                  </Link>
                </h3>
                <p className="mt-3 max-w-[34ch] text-[1.05rem] leading-relaxed text-home-slate">
                  {story.body}
                </p>
                <Link href={detailHref} className={textLink}>
                  {labels.viewDetails}
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </article>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label={labels.prev}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-home-line bg-home-white text-home-ink transition-colors hover:border-home-teal hover:text-home-teal"
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label={labels.next}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-home-line bg-home-white text-home-ink transition-colors hover:border-home-teal hover:text-home-teal"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <div className="flex items-center gap-2" role="tablist">
                {stories.map((s, i) => (
                  <button
                    key={s.slug}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={labels.goTo(i + 1)}
                    onClick={() => go(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === index
                        ? "w-7 bg-home-teal"
                        : "w-2.5 bg-home-line hover:bg-home-slate/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
