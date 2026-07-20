import type { Metadata } from "next";
import { getHomeContent } from "@/lib/home-content";
import type { Locale } from "@/lib/i18n";
import SiteHeader from "@/components/home/site-header";
import Hero from "@/components/home/hero";
import Services from "@/components/home/services";
import Outcomes from "@/components/home/outcomes";
import Scale from "@/components/home/scale";
import Work from "@/components/home/work";
import Insights from "@/components/home/insights";
import ContactCta from "@/components/home/contact-cta";
import SiteFooter from "@/components/home/site-footer";
import SiteAdvisor from "@/components/home/site-advisor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const { meta } = getHomeContent(locale);
  return { title: meta.title, description: meta.description };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;
  const content = getHomeContent(locale);

  return (
    <div className="font-home-body bg-home-paper text-home-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:bg-home-white focus:px-4 focus:py-3"
      >
        Skip to content
      </a>
      <SiteHeader locale={locale} nav={content.nav} />
      <main id="main">
        <Hero hero={content.hero} />
        <Services services={content.services} />
        <Outcomes outcomes={content.outcomes} />
        <Scale scale={content.scale} />
        <Work work={content.work} locale={locale} />
        <Insights insights={content.insights} />
        <ContactCta contact={content.contact} />
      </main>
      <SiteFooter locale={locale} footer={content.footer} />
      <SiteAdvisor locale={locale} />
    </div>
  );
}
