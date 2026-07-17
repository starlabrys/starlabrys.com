"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

export default function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const otherLocale = locales.find((l) => l !== locale)!;
  const segments = pathname.split("/").filter(Boolean);
  segments[0] = otherLocale;
  const target = "/" + segments.join("/");

  return (
    <Link
      href={target}
      className="text-sm text-text-secondary hover:text-foreground"
    >
      {otherLocale.toUpperCase()}
    </Link>
  );
}
