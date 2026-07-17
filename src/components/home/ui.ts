export const shell = "mx-auto w-[min(1120px,calc(100%-2.5rem))]";

const btnBase =
  "inline-flex min-h-[2.85rem] items-center justify-center rounded-sm border border-transparent px-5 py-[0.65rem] text-[0.95rem] font-semibold transition-colors";

export const btnPrimary = `${btnBase} bg-home-teal text-home-white hover:bg-home-teal-deep`;
export const btnGhost = `${btnBase} border-white/55 text-home-white hover:bg-white/10`;
export const btnGhostDark = `${btnBase} border-home-ink/35 text-home-ink hover:bg-home-ink/5`;

export const textLink =
  "group mt-4 inline-flex items-center gap-1 text-[0.95rem] font-semibold text-home-teal";

export const eyebrow =
  "mb-2 block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-home-teal";

export const sectionHeadTitle =
  "font-display text-[clamp(1.85rem,3vw,2.5rem)] font-bold";
