import Image from "next/image";
import Reveal from "./reveal";
import { btnGhost, btnPrimary, shell } from "./ui";
import type { HomeContent } from "@/lib/home-content";

export default function Hero({ hero }: { hero: HomeContent["hero"] }) {
  const titleLines = hero.title.split("\n");

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-[calc(4.25rem+2.5rem)] pb-[4.5rem] text-home-white">
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#0b1c22_0%,#16343a_42%,#1a4548_72%,#0f2a2e_100%)]" />
      <div className="absolute inset-0 animate-grid-drift bg-[image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[length:72px_72px] [mask-image:radial-gradient(ellipse_80%_70%_at_60%_40%,#000_20%,transparent_75%)] motion-reduce:animate-none" />
      <div className="absolute inset-x-[-20%] top-[10%] h-[45%] rotate-[-8deg] animate-beam-sweep bg-[linear-gradient(100deg,transparent_0%,rgba(197,228,225,0.12)_35%,rgba(15,110,106,0.28)_55%,transparent_85%)] blur-[2px] motion-reduce:animate-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_75%_55%,rgba(15,110,106,0.35),transparent_70%),linear-gradient(to_top,rgba(11,28,34,0.92)_0%,rgba(11,28,34,0.35)_45%,transparent_70%)]" />

      <div
        className={`${shell} relative z-10 grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12`}
      >
        <div className="max-w-[38rem] @container">
          <Reveal>
            <p className="font-display mb-5 text-[clamp(2.75rem,12.5cqw,4.5rem)] leading-[0.95] font-extrabold tracking-tight">
              {hero.brand}
            </p>
          </Reveal>
          <Reveal delay={1}>
            <h1 className="font-display mb-4 text-[clamp(1.65rem,3.2vw,2.35rem)] leading-tight font-semibold">
              {titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </Reveal>
          <Reveal delay={2}>
            <p className="mb-7 max-w-[34rem] text-[1.05rem] leading-relaxed whitespace-pre-line opacity-90">
              {hero.lede}
            </p>
          </Reveal>
          <Reveal delay={2}>
            <div className="flex flex-wrap gap-3">
              <a href="#contact" className={btnPrimary}>
                {hero.ctaPrimary}
              </a>
              <a href="#work" className={btnGhost}>
                {hero.ctaSecondary}
              </a>
            </div>
          </Reveal>
        </div>

        {hero.image ? (
          <Reveal delay={1} className="min-w-0">
            <div className="overflow-hidden rounded-sm border border-white/15 bg-home-ink/40 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              <Image
                src={hero.image}
                alt=""
                width={1914}
                height={932}
                sizes="(max-width: 1024px) 100vw, min(640px, 50vw)"
                className="h-auto w-full"
                priority
              />
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
