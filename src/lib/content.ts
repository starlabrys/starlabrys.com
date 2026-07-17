import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import type { Locale } from "./i18n";

const contentDir = path.join(process.cwd(), "content");

export interface PageContent {
  title: string;
  description: string;
  html: string;
}

export async function getPageContent(
  locale: Locale,
  slug: string,
): Promise<PageContent> {
  const filePath = path.join(contentDir, locale, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const processed = await remark().use(remarkHtml).process(content);
  return {
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    html: processed.toString(),
  };
}
