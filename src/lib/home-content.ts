import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Locale } from "./i18n";

const contentDir = path.join(process.cwd(), "content");

export interface HomeContent {
  meta: { title: string; description: string };
  nav: {
    services: string;
    capabilities: string;
    work: string;
    insights: string;
    contact: string;
  };
  hero: {
    brand: string;
    title: string;
    lede: string;
    ctaPrimary: string;
    ctaSecondary: string;
    image?: string;
  };
  services: {
    title: string;
    intro: string;
    flagship: {
      eyebrow: string;
      title: string;
      body: string;
      link: string;
    };
    capabilities: { title: string; body: string; link: string }[];
  };
  outcomes: {
    title: string;
    intro: string;
    items: { title: string; body: string }[];
  };
  scale: {
    title: string;
    intro: string;
    stats: { dt: string; dd: string }[];
  };
  work: {
    title: string;
    intro: string;
    stories: {
      slug: string;
      eyebrow?: string;
      title: string;
      body: string;
      /** 相对站点根路径，如 /images/firewall/main.png */
      image?: string;
    }[];
  };
  insights: {
    title: string;
    intro: string;
    items: { tag: string; title: string }[];
  };
  contact: {
    title: string;
    body: string;
    ctaEmail: string;
    ctaExplore: string;
    email: string;
  };
  footer: {
    blurb: string;
    columns: { heading: string; links: { label: string; href: string }[] }[];
  };
}

export function getHomeContent(locale: Locale): HomeContent {
  const filePath = path.join(contentDir, locale, "home.md");
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  return data as HomeContent;
}
