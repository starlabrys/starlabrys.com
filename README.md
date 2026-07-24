# starlabrys.com

Starlabrys（星钺（大连）科技有限公司）官网。Next.js（App Router）静态导出，中英双语，内容用 Markdown 维护。详见 [`TASK-SPEC-nextjs-website.md`](TASK-SPEC-nextjs-website.md)。

## 本地开发

前置：Node（见 `.nvmrc`）、[uv](https://docs.astral.sh/uv/)。

```bash
task install   # 可选：npm + advisor Python 依赖
task api       # 后端 :30001（uv 按 advisor/.python-version 使用最新 3.14）
# 另开终端
task ui        # 前端 :30000
```

访问 <http://localhost:30000/zh> 或 <http://localhost:30000/en>。顾问 API：<http://127.0.0.1:30001/health>。

## 构建

```bash
npm run build
```

产出纯静态文件到 `out/`。本地预览构建产物：

```bash
npx serve out
```

## 更新内容

页面文案在 `content/{zh,en}/*.md`（`home` / `about` / `team` / `services`），改完直接 push 即可，Cloudflare Pages 会自动重新构建部署。联系方式等结构化文案（如 `/contact` 页）在对应的 `src/app/[locale]/**/page.tsx` 里维护。

## 部署

Cloudflare Pages，构建命令 `npm run build`，输出目录 `out`，自定义域名 `starlabrys.com`（域名与 DNS 均在同一 Cloudflare 账号）。

## 访问统计

[Umami](https://cloud.umami.is)（无 cookie），脚本在 `src/components/analytics.tsx`，由根 layout 注入。website id 由原 pomodoro 站点改绑为本站。
