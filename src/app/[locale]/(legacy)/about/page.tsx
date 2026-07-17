import { getPageContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;
  const content = await getPageContent(locale, "about");

  return (
    <div className="markdown" dangerouslySetInnerHTML={{ __html: content.html }} />
  );
}
