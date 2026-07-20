import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { locales, type Locale } from "./i18n";

const contentDir = path.join(process.cwd(), "content");

export interface WorkProject {
  slug: string;
  title: string;
  description: string;
  eyebrow?: string;
  image?: string;
  summary: string;
  backLabel: string;
  contactCta: string;
  sections: { title: string; body: string }[];
  galleryTitle?: string;
  gallery?: { src: string; title: string; body: string }[];
}

function workDir(locale: Locale) {
  return path.join(contentDir, locale, "work");
}

export function getWorkSlugs(locale: Locale = "zh"): string[] {
  const dir = workDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}

export function getAllWorkParams() {
  return locales.flatMap((locale) =>
    getWorkSlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export function getWorkProject(
  locale: Locale,
  slug: string,
): WorkProject | null {
  const filePath = path.join(workDir(locale), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  return {
    slug,
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    eyebrow: data.eyebrow as string | undefined,
    image: data.image as string | undefined,
    summary: (data.summary as string) ?? "",
    backLabel: (data.backLabel as string) ?? "",
    contactCta: (data.contactCta as string) ?? "",
    sections: (data.sections as WorkProject["sections"]) ?? [],
    galleryTitle: data.galleryTitle as string | undefined,
    gallery: (data.gallery as WorkProject["gallery"]) ?? undefined,
  };
}
