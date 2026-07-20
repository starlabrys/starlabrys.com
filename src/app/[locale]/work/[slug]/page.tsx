import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/home/site-header";
import SiteFooter from "@/components/home/site-footer";
import { btnPrimary, eyebrow, sectionHeadTitle, shell } from "@/components/home/ui";
import { getHomeContent } from "@/lib/home-content";
import type { Locale } from "@/lib/i18n";
import { getAllWorkParams, getWorkProject } from "@/lib/work-content";

export function generateStaticParams() {
  return getAllWorkParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getWorkProject(locale as Locale, slug);
  if (!project) return {};
  return { title: project.title, description: project.description };
}

function Screenshot({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-sm border border-home-line bg-home-mist">
      <Image
        src={src}
        alt={alt}
        width={1920}
        height={1080}
        sizes="(max-width: 768px) 100vw, min(1120px, 92vw)"
        className="h-auto w-full"
        priority={priority}
      />
    </div>
  );
}

export default async function WorkProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as Locale;
  const project = getWorkProject(locale, slug);
  if (!project) notFound();

  const home = getHomeContent(locale);
  const workHref = `/${locale}#work`;
  const contactHref = `/${locale}#contact`;

  return (
    <div className="font-home-body bg-home-paper text-home-ink">
      <SiteHeader locale={locale} nav={home.nav} />
      <main id="main" className="pt-[4.25rem]">
        <section className="border-b border-home-line bg-home-white py-[4.5rem] md:py-[5.5rem]">
          <div className={shell}>
            <Link
              href={workHref}
              className="text-[0.95rem] font-semibold text-home-teal hover:text-home-teal-deep"
            >
              ← {project.backLabel}
            </Link>

            <div className="mt-8 max-w-[40rem]">
              {project.eyebrow ? (
                <span className={eyebrow}>{project.eyebrow}</span>
              ) : null}
              <h1 className={`${sectionHeadTitle} text-home-ink`}>
                {project.title}
              </h1>
              <p className="mt-4 text-[1.1rem] leading-relaxed text-home-slate">
                {project.summary}
              </p>
              <Link href={contactHref} className={`${btnPrimary} mt-8`}>
                {project.contactCta}
              </Link>
            </div>

            {project.image ? (
              <div className="mt-10">
                <Screenshot src={project.image} alt={project.title} priority />
              </div>
            ) : null}
          </div>
        </section>

        <section className="py-[4.5rem] md:py-[5.5rem]">
          <div className={`${shell} grid gap-12 md:grid-cols-3`}>
            {project.sections.map((section) => (
              <article key={section.title}>
                <h2 className="font-display text-[1.15rem] font-bold text-home-ink">
                  {section.title}
                </h2>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-home-slate">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {project.gallery && project.gallery.length > 0 ? (
          <section className="border-t border-home-line bg-home-white py-[4.5rem] md:py-[5.5rem]">
            <div className={shell}>
              {project.galleryTitle ? (
                <h2 className={`${sectionHeadTitle} mb-12 text-home-ink`}>
                  {project.galleryTitle}
                </h2>
              ) : null}
              <div className="flex flex-col gap-16">
                {project.gallery.map((shot) => (
                  <figure key={shot.src} className="flex flex-col gap-5">
                    <Screenshot src={shot.src} alt={shot.title} />
                    <figcaption className="max-w-[40rem]">
                      <h3 className="font-display text-[1.2rem] font-bold text-home-ink">
                        {shot.title}
                      </h3>
                      <p className="mt-3 text-[1.05rem] leading-relaxed text-home-slate">
                        {shot.body}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="border-t border-home-line bg-home-paper py-14">
          <div
            className={`${shell} flex flex-wrap items-center justify-between gap-4`}
          >
            <Link
              href={workHref}
              className="text-[0.95rem] font-semibold text-home-teal hover:text-home-teal-deep"
            >
              ← {project.backLabel}
            </Link>
            <Link href={contactHref} className={btnPrimary}>
              {project.contactCta}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} footer={home.footer} />
    </div>
  );
}
