# Task Spec: 星钺科技官网（Next.js 静态站点）

| 字段 | 值 |
| --- | --- |
| **状态** | In Progress — Phase 0–3 已完成（2026-07-13），待 Phase 4 部署 |
| **目标** | 为星钺（大连）科技有限公司（品牌名 Starlabrys）搭建官方网站：展示品牌故事、业务范围（软件开发/IT 咨询）与联系方式；纯静态、内容用 Markdown 维护、单人可长期打理 |
| **非目标** | 不做用户系统 / 后台管理 / CMS；不做电商或表单提交后端；不做博客（预留扩展位，暂不实现）；不公开工商注册细节（信用代码、注册资本等，见 §8 Q1） |
| **前置依赖** | 域名 `starlabrys.com` 已购买，托管在 Cloudflare（见 §8 Q4）；公司信息 source of truth 见内部资料（非公开，不在本仓库中） |
| **关联 Issue** | 暂无（新项目，如需跟踪可在 Linear 建 issue） |
| **Source of truth** | 本文 + 本仓库代码 |

---

## 1. 背景

### 1.1 公司现状（摘自 `company-profile.md`）

| 字段 | 值 |
| --- | --- |
| 公司名称 | 星钺（大连）科技有限公司 |
| 品牌英文名 | Starlabrys |
| 经营范围 | 软件开发；信息技术咨询服务；技术服务/开发/咨询/交流/转让/推广 |
| 业务状态 | 早期阶段 |

### 1.2 网站定位

单人技术公司的官网，核心作用是**建立品牌可信度**，而非支撑复杂业务系统：

1. 品牌故事：Starlabrys 命名由来（星 + 钺，见备忘录）作为差异化亮点
2. 业务展示：软件开发、技术咨询服务范围
3. 联系方式：邮箱 / GitHub
4. 中英双语（公司主体在国内，品牌面向可能的境外/技术受众）

维护者是技术人员，内容直接写 Markdown 提交到仓库，不需要可视化编辑后台。

---

## 2. 技术选型

| 项 | 选择 | 理由 |
| --- | --- | --- |
| 框架 | **Next.js（App Router）+ 静态导出** `output: 'export'` | 团队已确定用 Next.js；静态导出产物为纯 HTML/CSS/JS，无需 Node 服务器 |
| 内容 | Markdown + frontmatter，`gray-matter` + `remark`/`rehype` 解析 | 技术人员维护，Git 提交即发布，无需接 next-mdx-remote 等更重的方案（除非后续要在 md 里嵌组件） |
| 样式 | Tailwind CSS | 官网页面少，Tailwind 省去自建设计系统的开销 |
| i18n | 手动 `[locale]` 动态路由段（`zh` / `en`）+ `generateStaticParams` | 静态导出下最简单可靠的双语方案，不引入 next-intl 等库的运行时依赖 |
| 托管 | **Cloudflare Pages**（见 §8 Q3） | 免费额度宽松、国内访问相对稳定、纯静态托管天然免掉大陆服务器 ICP 备案 |
| 域名 | `starlabrys.com` → Cloudflare Pages 自定义域名 | 见 §8 Q4，需确认域名归属与 DNS 托管方 |

### 2.1 视觉设计规范（已确认）

风格方向：**暗色极简 + 星/钺意象**，強调品牌故事的独特性，非通用企业模板观感。

| 项 | 规范 |
| --- | --- |
| 主背景色 | `#0a0a12`（深空黑） |
| 强调色 | 渐变：靛蓝 `#4b5fd9` → 银白 `#e8eaf0`，用于分割线、按钮描边、hover 态 |
| 正文文字 | 浅灰白 `#e6e6ec`（避免纯白刺眼），次要文字 `#9a9aa8` |
| 标题字体 | 无衬线，字重较高（如 Geist / Inter Bold），配合宽字距营造硬朗感 |
| 正文字体 | 同系 Inter/Geist，常规字重，保证暗色背景下可读性（对比度 ≥ 4.5:1） |
| 视觉意象 | 首页 Hero 区细微星空点缀（少量随机小圆点/低透明度），"钺"以几何线条/极简 icon 形式点缀（避免写实斧头图形显得突兀），不做满屏动画 |
| 分割线 / 强调元素 | 用一道渐变细线（靛蓝→银白）替代传统 `<hr>`，呼应"星"与"钺"两种意象的交汇 |
| 明暗模式 | 仅暗色，不做浅色模式切换（保持品牌一致性，官网非工具类应用不需要跟随系统主题） |
| 语言切换 | 顶部导航右侧简单文字切换 `ZH / EN`，非图标国旗 |

> 实现依赖 Tailwind：`tailwind.config.ts` 中扩展 `colors`（background/accent-start/accent-end/text-primary/text-secondary），避免页面组件里散落 hex 值。

### 2.2 可选后续增强：Claude Design 组件库同步

**非本 spec Phase 0–5 的阻塞项**，先按 §4 正常写代码、上线，之后如需精细打磨组件视觉（Hero 星空效果、渐变分割线等）再评估引入：

- Claude Design（`claude.ai/design`）是组件级设计系统项目（按钮/卡片/导航/色板等可视化预览库），不是整页排版工具，与本 spec 是**分工**而非替代关系：spec 管范围/决策/Phase，Claude Design 管 §2.1 设计规范的组件级可视化迭代
- 通过 `/design-sync` 技能与本地 `src/components/` 增量同步（一次几个组件，非整体替换）
- 需先确认该 skill 在实际使用环境中已安装/可用（当前会话未在可用 skill 列表中出现），必要时先跑 `/design-login` 授权

---

## 3. 目录结构

```text
starlabrys.com/
├── TASK-SPEC-nextjs-website.md
├── README.md
├── next.config.js                 # output: 'export'
├── package.json
├── tailwind.config.ts
├── content/
│   ├── zh/
│   │   ├── home.md
│   │   ├── about.md
│   │   ├── team.md
│   │   └── services.md
│   └── en/
│       ├── home.md
│       ├── about.md
│       ├── team.md
│       └── services.md
├── src/
│   ├── app/
│   │   ├── globals.css            # 暗色设计 token（§2.1）+ .markdown 排版样式
│   │   ├── favicon.ico
│   │   └── [locale]/              # 无 src/app/layout.tsx——本目录的 layout.tsx 即根 layout
│   │       ├── layout.tsx         # <html lang={locale}>、导航/页脚、generateStaticParams、generateMetadata
│   │       ├── page.tsx           # 首页
│   │       ├── about/page.tsx
│   │       ├── team/page.tsx
│   │       ├── services/page.tsx
│   │       └── contact/page.tsx
│   ├── lib/
│   │   ├── i18n.ts                # Locale 类型 + locales/defaultLocale（不含 fs 依赖，供 Client Component 安全引用）
│   │   └── content.ts             # 读取 content/{locale}/*.md，frontmatter 解析（fs/gray-matter/remark，仅 Server Component 引用）
│   └── components/
│       ├── nav.tsx
│       ├── footer.tsx
│       └── language-switch.tsx    # "use client"，usePathname() 替换 locale 段
└── public/
    ├── index.html                 # 根 "/" 重定向到 /zh/（meta refresh + JS replace），构建时原样复制到 out/
    └── favicon.ico / *.svg
```

> **与最初设计的差异**：原计划 `src/app/layout.tsx`（根）+ `[locale]/layout.tsx`（嵌套）分离，实测 Next.js App Router 的根 layout 必须包含 `<html>/<body>`，且不便按 `[locale]` 动态设置 `lang` 属性；改为**删除 `src/app/layout.tsx`，`[locale]/layout.tsx` 直接作为根 layout**（Next.js 官方 i18n 范式），根路径 `/` 改用 `public/index.html` 静态重定向处理，避免路由结构冲突。

---

## 4. 实施阶段

### Phase 0 — 项目初始化 ✅

- [x] `npx create-next-app@latest` 初始化（TypeScript + App Router + Tailwind + ESLint）
- [x] `next.config.ts` 设置 `output: 'export'`，`images: { unoptimized: true }`（静态导出不支持默认图片优化）
- [x] 确认 `npm run build` 产出 `out/` 目录

### Phase 1 — 内容与 i18n 骨架 ✅

- [x] `src/lib/content.ts`：按 `locale` + `slug` 读取 `content/{locale}/{slug}.md`，`gray-matter` 解析 frontmatter，`remark` 转 HTML（`Locale` 类型/常量拆到 `src/lib/i18n.ts`，避免 `fs` 被打进客户端 bundle）
- [x] `src/app/[locale]/layout.tsx` + `generateStaticParams` 返回 `[{locale:'zh'},{locale:'en'}]`（无 `src/app/layout.tsx`，`[locale]/layout.tsx` 即为根 layout，`<html lang={locale}>` 按语言正确设置）
- [x] 根 `/` 静态重定向到 `/zh`：改用 `public/index.html`（meta refresh + JS `location.replace`），构建时被复制到 `out/index.html`，避免和 `[locale]` 根 layout 的结构冲突
- [x] 语言切换组件：`src/components/language-switch.tsx`，基于 `usePathname()` 替换 locale 段

### Phase 2 — 页面内容 ✅

- [x] 首页：Hero（Starlabrys 品牌 + 一句话定位）、业务简介、CTA 联系
- [x] 关于页：命名故事精简版（星 + 钺，按 §8 Q1）
- [x] 团队页：创始团队技术经历草稿（按 §6.1 脱敏原则取舍——公司名保留、内部架构细节压缩为一句话、无手机号/家庭信息）**已写入 `content/{zh,en}/team.md`，待王越 review 后再视为定稿**
- [x] 服务页：软件开发、IT 咨询服务范围
- [x] 联系页：邮箱、GitHub 链接

### Phase 3 — 构建验证 ✅

- [x] `npm run build` 通过（TypeScript + ESLint 均无报错），本地 `npx serve out` 走查 `/`、`/zh`、`/en`、`/en/team`、`/zh/contact` 等路由，HTTP 200
- [x] 静态导出产物路径确认：`out/zh.html`、`out/en.html`、`out/{zh,en}/{about,team,services,contact}.html`（Next 静态导出用 `locale.html` + `locale/slug.html` 扁平命名，非 `index.html` 子目录形式，Cloudflare Pages 原生支持这种 clean URL 映射）
- [x] 语言切换验证：`/en/team` 页面的切换链接正确指向 `/zh/team`
- [x] `<title>`/`<html lang>` 按语言正确区分（新增 `generateMetadata` 按 locale 返回不同 title/description）

### Phase 4 — 部署

- [ ] Cloudflare Pages 新建项目，连接本仓库（或 `wrangler pages deploy out`）
- [ ] 构建命令 `npm run build`，输出目录 `out`
- [ ] 绑定自定义域名 `starlabrys.com`（域名与 DNS 均在同一 Cloudflare 账号，Pages 项目内直接添加自定义域名即可，见 §8 Q4）

### Phase 5 — 验收 + 文档

- [ ] §7 验收全部通过（Cloudflare Pages 部署相关项待 Phase 4）
- [x] `README.md` 补充：本地开发、内容更新（改 `content/*.md` 即可）、部署流程

---

## 5. 关键配置

`next.config.ts`（实际使用 TypeScript 配置文件，create-next-app 默认产出）：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
```

Markdown frontmatter 约定（`content/{locale}/*.md`）：

```yaml
---
title: "Starlabrys — 星钺科技"
description: "软件开发与技术咨询"
---
```

---

## 6. 内容大纲（sitemap）

| 路径 | 内容 |
| --- | --- |
| `/zh`、`/en` | 首页：品牌 Hero + 业务简介 + CTA |
| `/zh/about`、`/en/about` | 关于：公司/品牌故事 |
| `/zh/team`、`/en/team` | 团队：创始团队的技术背景与过往经验（非"客户案例"，见 §8 Q6） |
| `/zh/services`、`/en/services` | 服务：软件开发、IT 咨询 |
| `/zh/contact`、`/en/contact` | 联系方式 |

### 6.1 团队页内容来源与脱敏原则

素材来源：创始人个人简历与项目档案（非公开，不在本仓库中）。官网团队页只做**摘取和脱敏后的呈现**，原始简历不对外发布。

| 分类 | 内容 | 处理方式 |
| --- | --- | --- |
| ✅ 直接可用 | 开源项目：`comments-tree`、`enx`（enx-api/enx-chrome/enx-ui/enx-sync）、个人 Homelab K8s 集群；简历"自我简介"里的技术年限/技能广度总结 | 原样或小幅编辑后使用，附 GitHub 链接，作为团队页主要内容——可公开验证，最具说服力 |
| ⚠️ 需脱敏简化 | 职业履历（华信/楼兰/思科）中的具体内部架构细节与内部系统代号（原简历"贡献清单"里的具体模块名/代号，此处不展开） | 公司名可保留（属正常履历事实）；具体实现细节压缩成一句话职责描述，不列内部模块名/代号，例如："主导网络运维自动化平台的核心架构演进（并发控制、消息队列调度等）" |
| ⚠️ 需保持匿名 | 上海项目中的客户（简历已写作"某跨国工业企业"） | 继续沿用匿名表述，不还原真实客户名 |
| ❌ 不放 | 手机号码；任何家庭/私人信息 | 联系方式只保留邮箱（当前个人邮箱或后续公司邮箱）+ GitHub + Blog，不放手机号；与 §8 Q1（命名故事不放个人家庭信息）原则一致 |

> 实际页面文案（`content/zh/team.md` / `content/en/team.md`）在 Phase 2 编写，需按上表逐条对照原始简历取舍，写好后先给王越 review 再合入。

---

## 7. 验收标准

- [ ] `npm run build` 无错误，产出纯静态 `out/`
- [ ] 中英文五组页面（首页/关于/团队/服务/联系）均可访问，语言切换正确跳转对应页面
- [ ] 根路径 `/` 能到达默认语言首页
- [ ] Cloudflare Pages 部署成功，`starlabrys.com` 可通过自定义域名访问，HTTPS 有效
- [ ] 移动端/桌面端基本布局正常（Tailwind 响应式）
- [ ] 内容更新流程验证：改一处 `content/*.md` → push → Cloudflare Pages 自动重新构建部署

---

## 8. 已确认决策

| # | 问题 | 决策 |
| --- | --- | --- |
| Q1 | 命名故事披露到什么程度？ | ✅ 只放**品牌故事精简版**（Star + Labrys 寓意），不放夫人姓名等个人家庭信息；完整备忘录仅内部留档（非公开，不在本仓库中） |
| Q2 | 是否需要博客/动态内容？ | ✅ 暂不需要，MVP 不做；`content/` 结构预留后续加 `blog/` 子目录的扩展空间 |
| Q3 | 部署平台：Cloudflare Pages vs Vercel？ | ✅ **Cloudflare Pages** |
| Q4 | 域名 `starlabrys.com` 归属与 DNS？ | ✅ 已购买，**注册与 DNS 均在 Cloudflare**——Pages 绑定自定义域名时可直接在同账号内添加，无需额外域名迁移 |
| Q5 | 是否需要备案（ICP）？ | ✅ 暂不需要（静态站点托管在 Cloudflare Pages，境外） |
| Q6 | 公司没有客户项目历史，"成功案例"怎么展示？ | ✅ 不做"客户案例"（Case Study）板块；改为独立 **团队（Team）页面**，展示创始团队（目前为王越）过往的技术经历——即个人职业履历的合并呈现，作为公司整体技术实力的背书。展示边界：只写**角色 / 技术栈 / 解决的问题类型**，不透露前雇主的客户名称、业务数据等保密信息；待公司自身有真实客户项目后，再新增"案例研究"板块 |

**决策日期**：2026-07-13

---

## 9. 回滚

| 阶段 | 回滚方式 |
| --- | --- |
| Phase 0–3 | 本地开发阶段，直接删除/重置代码，无外部影响 |
| Phase 4 | Cloudflare Pages 删除项目 / 解绑自定义域名，DNS 记录改回原状态（若有） |
