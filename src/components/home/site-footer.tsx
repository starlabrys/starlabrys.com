import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { HomeContent } from "@/lib/home-content";
import { shell } from "./ui";

export default function SiteFooter({
  locale,
  footer,
}: {
  locale: Locale;
  footer: HomeContent["footer"];
}) {
  return (
    <footer className="bg-home-ink text-white/80">
      <div className={`${shell} grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4`}>
        <div>
          <Link
            href={`/${locale}`}
            className="font-display text-[1.15rem] font-extrabold tracking-tight text-home-white"
          >
            Starlabrys
          </Link>
          <p className="mt-3 max-w-[24ch] text-[0.9rem] text-white/60">
            {footer.blurb}
          </p>
        </div>
        {footer.columns.map((column) => (
          <div key={column.heading}>
            <h4 className="mb-3 text-[0.85rem] font-semibold text-white/50">
              {column.heading}
            </h4>
            <div className="flex flex-col gap-2">
              {column.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[0.9rem] text-white/75 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={`${shell} border-t border-white/10 py-6 text-[0.8rem] text-white/50`}>
        <p>© {new Date().getFullYear()} Starlabrys</p>
      </div>
    </footer>
  );
}
