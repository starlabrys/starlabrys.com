import Link from "next/link";
import LanguageSwitch from "./language-switch";
import type { Locale } from "@/lib/i18n";

const NAV_ITEMS: Record<Locale, { href: string; label: string }[]> = {
  zh: [
    { href: "", label: "首页" },
    { href: "/about", label: "关于" },
    { href: "/team", label: "团队" },
    { href: "#services", label: "服务" },
    { href: "#contact", label: "联系" },
  ],
  en: [
    { href: "", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/team", label: "Team" },
    { href: "#services", label: "Services" },
    { href: "#contact", label: "Contact" },
  ],
};

export default function Nav({ locale }: { locale: Locale }) {
  const items = NAV_ITEMS[locale];

  return (
    <header>
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link href={`/${locale}`} className="text-sm font-bold tracking-widest">
          STARLABRYS
        </Link>
        <div className="flex items-center gap-6 text-sm">
          {items.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className="text-text-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <LanguageSwitch locale={locale} />
        </div>
      </nav>
      <hr className="divider" />
    </header>
  );
}
