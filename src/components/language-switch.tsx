"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

const LABEL: Record<Locale, string> = { zh: "中文", en: "EN" };

export default function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex overflow-hidden rounded-sm border border-white/35"
    >
      {locales.map((l) => {
        const target = "/" + [l, ...segments.slice(1)].join("/");
        const active = l === locale;
        return (
          <Link
            key={l}
            href={target}
            aria-pressed={active}
            className={`px-[0.65rem] py-[0.4rem] text-[0.8rem] font-semibold tracking-wide transition-colors ${
              active ? "bg-white/16 text-white" : "text-white/70 hover:text-white"
            }`}
          >
            {LABEL[l]}
          </Link>
        );
      })}
    </div>
  );
}
