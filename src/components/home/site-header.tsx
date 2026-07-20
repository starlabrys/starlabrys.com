"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitch from "@/components/language-switch";
import type { Locale } from "@/lib/i18n";
import type { HomeContent } from "@/lib/home-content";
import { shell } from "./ui";

export default function SiteHeader({
  locale,
  nav,
}: {
  locale: Locale;
  nav: HomeContent["nav"];
}) {
  const [open, setOpen] = useState(false);

  const home = `/${locale}`;
  const items = [
    { href: `${home}#services`, label: nav.services },
    { href: `${home}#capabilities`, label: nav.capabilities },
    { href: `${home}#work`, label: nav.work },
    { href: `${home}#insights`, label: nav.insights },
    { href: `${home}#contact`, label: nav.contact },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-home-line-light bg-home-ink/55 text-home-white backdrop-blur-md animate-slide-down motion-reduce:translate-y-0 motion-reduce:animate-none">
      <div className={`${shell} flex h-[4.25rem] items-center gap-6`}>
        <Link
          href={`/${locale}`}
          className="font-display text-[1.15rem] font-extrabold tracking-tight"
        >
          Starlabrys
        </Link>
        <nav
          aria-label="Primary"
          className="ml-4 mr-auto hidden gap-[1.35rem] md:flex"
        >
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[0.9375rem] font-medium opacity-90 transition-opacity hover:opacity-100"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <LanguageSwitch locale={locale} />
          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block h-px w-5 bg-home-white" />
            <span className="block h-px w-5 bg-home-white" />
          </button>
        </div>
      </div>
      {open && (
        <nav
          aria-label="Primary"
          className="flex flex-col gap-1 border-t border-home-line-light bg-home-ink/95 px-6 py-4 md:hidden"
        >
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
