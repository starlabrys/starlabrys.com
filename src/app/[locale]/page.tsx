import Link from "next/link";
import { getPageContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

const CTA: Record<Locale, { primary: string; secondary: string }> = {
  zh: { primary: "了解服务", secondary: "联系我们" },
  en: { primary: "Our services", secondary: "Contact us" },
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;
  const content = await getPageContent(locale, "home");
  const cta = CTA[locale];

  return (
    <div>
      <div
        className="markdown"
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
      <div className="mt-8 flex gap-4">
        <Link
          href={`/${locale}/services`}
          className="rounded-full border border-accent-start px-6 py-2 text-sm hover:bg-accent-start/10"
        >
          {cta.primary}
        </Link>
        <Link
          href={`/${locale}/contact`}
          className="rounded-full bg-gradient-to-r from-accent-start to-accent-end px-6 py-2 text-sm font-medium text-black"
        >
          {cta.secondary}
        </Link>
      </div>
    </div>
  );
}
