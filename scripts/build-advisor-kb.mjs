/**
 * Build advisor knowledge packs from content/{locale}/home.md and work/*.md
 * Usage: node scripts/build-advisor-kb.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const contentDir = path.join(root, "content");
const outDir = path.join(root, "advisor", "data");
const locales = ["zh", "en"];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function pushDoc(docs, doc) {
  docs.push({
    id: doc.id,
    type: doc.type,
    title: doc.title,
    summary: doc.summary,
    body: doc.body || "",
    url: doc.url || null,
    tags: [...new Set((doc.tags || []).map((t) => String(t).toLowerCase()))],
    email: doc.email || null,
  });
}

function buildLocale(locale) {
  const docs = [];
  const homePath = path.join(contentDir, locale, "home.md");
  const raw = fs.readFileSync(homePath, "utf8");
  const { data } = matter(raw);

  pushDoc(docs, {
    id: "home:meta",
    type: "company",
    title: data.meta?.title || "Starlabrys",
    summary: data.meta?.description || "",
    body: [data.hero?.lede, data.footer?.blurb].filter(Boolean).join("\n"),
    url: `/${locale}`,
    tags: ["company", "starlabrys", "about", "介绍", "公司"],
  });

  pushDoc(docs, {
    id: "home:hero",
    type: "company",
    title: data.hero?.brand || "Starlabrys",
    summary: (data.hero?.title || "").replace(/\n/g, " "),
    body: data.hero?.lede || "",
    url: `/${locale}`,
    tags: ["hero", "delivery", "项目", "交付"],
  });

  if (data.services) {
    pushDoc(docs, {
      id: "home:services",
      type: "service",
      title: data.services.title,
      summary: data.services.intro,
      body: data.services.flagship
        ? `${data.services.flagship.title}. ${data.services.flagship.body}`
        : "",
      url: `/${locale}#services`,
      tags: ["services", "delivery", "服务", "交付", "项目"],
    });
    for (const [i, cap] of (data.services.capabilities || []).entries()) {
      pushDoc(docs, {
        id: `home:capability:${i}`,
        type: "service",
        title: cap.title,
        summary: cap.body,
        body: cap.body,
        url: `/${locale}#capabilities`,
        tags: [
          "capability",
          "服务",
          "能力",
          ...String(cap.title).toLowerCase().split(/\s+/),
        ],
      });
    }
  }

  if (data.outcomes) {
    for (const [i, item] of (data.outcomes.items || []).entries()) {
      pushDoc(docs, {
        id: `home:outcome:${i}`,
        type: "service",
        title: item.title,
        summary: item.body,
        body: item.body,
        url: `/${locale}#outcomes`,
        tags: ["outcome", "价值", "客户"],
      });
    }
  }

  if (data.scale) {
    pushDoc(docs, {
      id: "home:scale",
      type: "fact",
      title: data.scale.title,
      summary: data.scale.intro,
      body: (data.scale.stats || [])
        .map((s) => `${s.dt}: ${s.dd}`)
        .join("\n"),
      url: `/${locale}`,
      tags: [
        "stack",
        "global",
        "kafka",
        "redis",
        "kubernetes",
        "kong",
        "docker",
        "python",
        "java",
        "技术栈",
        "全球",
        "迪拜",
        "uae",
      ],
    });
  }

  const contactEmail = data.contact?.email || "contact@starlabrys.com";
  pushDoc(docs, {
    id: "home:contact",
    type: "cta",
    title: data.contact?.title || "Contact",
    summary: data.contact?.body || "",
    body: `Email: ${contactEmail}`,
    url: `/${locale}#contact`,
    tags: ["contact", "email", "联系", "邮件", "咨询"],
    email: contactEmail,
  });

  for (const story of data.work?.stories || []) {
    const slug = story.slug;
    if (!slug) continue;
    const workPath = path.join(contentDir, locale, "work", `${slug}.md`);
    let detail = {};
    if (fs.existsSync(workPath)) {
      detail = matter(fs.readFileSync(workPath, "utf8")).data;
    }
    const galleryText = (detail.gallery || [])
      .map((g) => `${g.title}: ${g.body}`)
      .join("\n");
    const sectionsText = (detail.sections || [])
      .map((s) => `${s.title}: ${s.body}`)
      .join("\n");
    pushDoc(docs, {
      id: `work:${slug}`,
      type: "project",
      title: detail.title || story.title,
      summary: detail.summary || story.body,
      body: [story.body, sectionsText, galleryText].filter(Boolean).join("\n\n"),
      url: `/${locale}/work/${slug}`,
      tags: [
        "project",
        "案例",
        "work",
        slug,
        ...(detail.eyebrow ? [String(detail.eyebrow).toLowerCase()] : []),
        ...String(story.title || "")
          .toLowerCase()
          .split(/[\s、,/]+/)
          .filter(Boolean),
      ],
    });
  }

  const quickPrompts =
    locale === "zh"
      ? [
          "你们公司主要做什么？",
          "看看路由路径与防火墙策略项目",
          "AI 日志分析是做什么的？",
          "微服务框架能接入我们的服务吗？",
          "怎么联系你们？",
        ]
      : [
          "What does Starlabrys do?",
          "Tell me about the route-path firewall policy project",
          "What is the AI log analysis project?",
          "Can we plug our services into the microservices framework?",
          "How can I contact you?",
        ];

  return {
    locale,
    generatedAt: new Date().toISOString(),
    contactEmail,
    bootstrap: {
      welcome:
        locale === "zh"
          ? "你好，我是 Starlabrys 项目顾问。可以根据官网公开内容，帮你了解服务与案例，并引导联系团队。"
          : "Hi — I’m the Starlabrys project advisor. I can help based on public site content, point you to case studies, and guide you to contact the team.",
      disclaimer:
        locale === "zh"
          ? "回答基于公开官网内容，不构成要约或报价。"
          : "Answers are based on public website content and are not an offer or quote.",
      title: locale === "zh" ? "项目顾问" : "Project advisor",
      placeholder:
        locale === "zh" ? "描述你的需求或想了解的案例…" : "Describe your need or ask about a project…",
      sendLabel: locale === "zh" ? "发送" : "Send",
      openLabel: locale === "zh" ? "咨询顾问" : "Ask advisor",
      closeLabel: locale === "zh" ? "关闭" : "Close",
      mailLabel: locale === "zh" ? "发邮件联系" : "Email us",
      quickPrompts,
    },
    docs,
  };
}

ensureDir(outDir);
for (const locale of locales) {
  const pack = buildLocale(locale);
  const outPath = path.join(outDir, `kb.${locale}.json`);
  fs.writeFileSync(outPath, JSON.stringify(pack, null, 2), "utf8");
  console.log(`Wrote ${outPath} (${pack.docs.length} docs)`);
}
