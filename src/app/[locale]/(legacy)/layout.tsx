import Nav from "@/components/nav";
import Footer from "@/components/footer";
import type { Locale } from "@/lib/i18n";

export default async function LegacyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Nav locale={locale} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
