# Starlabrys 部署交接文档

> 给后续 AI agent / 人工部署用。  
> 整理自 2026-07 关于 PR #7（对话顾问）与生产架构的讨论。  
> **已定决策优先按本文执行；未决事项见文末「待办」。**

---

## 1. 目标架构（已拍板）

| 层 | 域名 | 托管 | 说明 |
|----|------|------|------|
| 前端静态站 | `starlabrys.com`（apex）+ `www.starlabrys.com` | **Cloudflare Pages** + CDN | Next.js `output: "export"`，构建产物目录 `out` |
| 顾问 API（Python） | `api.starlabrys.com` | **AWS**（具体服务待定）+ **Cloudflare 代理（橙云）** | FastAPI / uvicorn，见仓库 `advisor/` |

```
浏览器
  ├─ https://starlabrys.com/*     → Cloudflare Pages（静态）
  └─ https://api.starlabrys.com/* → Cloudflare 代理（橙云）→ AWS 上的 Advisor
```

**不要**指望 Cloudflare Pages 直接跑 Python。Pages 只托管静态前端；顾问服务必须独立部署。

---

## 2. 术语

- **apex**：裸域名 / 根域名，即 `starlabrys.com`（没有 `www` 前缀）。
- **子域**：如 `www.starlabrys.com`、`api.starlabrys.com`。
- **Cloudflare 代理（橙云）**：DNS 记录开启 Proxy，流量先经 Cloudflare 再回源到 AWS。可获得基础 DDoS / 有限 WAF；灰云（DNS only）则直连源站，无 CF 防护。

---

## 3. `api.starlabrys.com`：走 Cloudflare 代理

### 3.1 为什么走代理

- Free 套餐下，代理开启后有 **基础 DDoS 防护** 和 **有限 WAF**，一般无额外按请求计费。
- 完整/可细调 WAF、高级 Bot 管理等在 **Pro 及以上**；当前小站 Free 够用。
- 证书可由 Cloudflare 统一签发（Flexible / Full / Full strict；生产建议 **Full (strict)**，源站需有效证书或用 CF Origin CA）。

### 3.2 缓存：不要开

API 是动态的（含 `POST`、会话）。对 `api.starlabrys.com`：

- **不要**做边缘缓存对话结果。
- 配置 **Cache Rule: Bypass**（或等价「不缓存该主机 / 该路径」）。
- 走 Cloudflare 的目的是 **防护与统一入口**，不是 CDN 加速静态资源。

### 3.3 DNS 示意

在 Cloudflare DNS（假设域名已在同一 CF 账号）：

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME 或 A/AAAA | `api` | AWS 负载均衡 / 公网 IP / 目标主机名 | **Proxied（橙云）** |
| （已有）Pages 自定义域 | apex / `www` | Pages 项目 | 由 Pages 绑定管理 |

源站（AWS）安全组 / 防火墙建议：

- 仅允许 Cloudflare IP 段访问 443（可选加固），或至少只暴露 HTTPS。
- 健康检查路径：`GET /health`（本地默认 `http://127.0.0.1:30001/health`）。

---

## 4. 前端 ↔ API 联通

### 4.1 前端如何找 API

`src/components/home/site-advisor.tsx`：

```ts
function advisorApiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_ADVISOR_API?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "/api"; // 本地 prod-server 同域反代时用
}
```

生产（Pages + 独立 API 子域）应设置构建环境变量：

```bash
NEXT_PUBLIC_ADVISOR_API=https://api.starlabrys.com
```

浏览器会 **直接请求** `https://api.starlabrys.com/...`（中间是否经 CF 取决于该子域是否橙云；已定为走代理）。

### 4.2 CORS

跨域（`starlabrys.com` → `api.starlabrys.com`）时，Advisor 需允许：

- Origin：`https://starlabrys.com`、`https://www.starlabrys.com`（按实际绑定）
- Methods：至少 `GET`、`POST`、`OPTIONS`
- Headers：`Content-Type` 等前端实际使用的头

（本地同域 `/api` 反代见 `scripts/prod-server.mjs`，**生产 Pages 不走这套 Node 静态服务器**。）

### 4.3 主要 API

见 `advisor/README.md`：

- `GET /health`
- `GET /v1/bootstrap?locale=zh|en`
- `POST /v1/advise` 或文档中的 chat 路径（以代码 `advisor/app/main.py` 为准）

当前实现以 **知识库关键词匹配 + 打分为主**；LLM API Key 有占位，未配置也可演示。

---

## 5. 本地开发端口（对照）

| 服务 | 端口 | 命令 / 说明 |
|------|------|-------------|
| Advisor 后端 | `30001` | `task api`（uv 管理 Python，见 `advisor/.python-version`） |
| Next 前端 | `30000` | `task ui`（自动设 `NEXT_PUBLIC_ADVISOR_API=http://127.0.0.1:30001`） |
| 生产联启（单机） | 30000 + 本机反代 `/api` | `npm run prod:all`（**不是** CF Pages 生产形态） |

知识包生成：`npm run advisor:kb`（`build` 时也会跑）。

---

## 6. Cloudflare Pages（前端）

已有规格见根目录 `TASK-SPEC-nextjs-website.md` Phase 4：

- 构建命令：`npm run build`
- 输出目录：`out`
- 绑定：`starlabrys.com` / `www`（域名与 DNS 在同一 CF 账号）

Pages **不能**原生反代外部 AWS（`_redirects` 不够用）。若以后要同域 `/api`，需 Pages Functions / Worker；**当前方案不要求**，用 `api.` 子域即可。

---

## 7. AWS 后端（待落地，方向已定）

目标：在 AWS 跑 `advisor/`（Python **3.11+**，本地钉最新稳定版见 `advisor/.python-version`；用 **uv** 安装解释器与依赖）。

候选（由后续会话选型，不在本文锁死）：

- ECS Fargate / EC2 + Docker
- App Runner
- 轻量 EC2 + systemd / docker compose

无论哪种，对外应提供：

1. `https://api.starlabrys.com` 的源站（给 CF 回源）
2. `/health` 健康检查
3. CORS 允许官网 Origin
4. 环境变量：`ADVISOR_*`（见 `advisor/app/config.py`；LLM 可选）

部署前在仓库根生成 KB：`npm run advisor:kb`，确保 `advisor/data/kb.*.json` 与站点内容一致（或在镜像构建步骤里生成）。

---

## 8. 相关 PR / 仓库状态备忘

- PR：https://github.com/starlabrys/starlabrys.com/pull/7  
  分支：`add_basic_agent`  
  内容概要：对话顾问 + 案例详情页 + 首页文案；Python 服务在 `advisor/`。
- Review 时若排除 wiloon 的 commit：`5d0172d`（`fix img`，图片路径/slug 整理），功能主体来自 ew8 的 3 个 commit。
- `__pycache__`：应忽略；`.gitignore` 已补 Python 规则，并从索引移除已跟踪的 `.pyc`（若尚未提交，合并前请一并提交）。

### 脱敏结论（内容侧）

- **ITSM**、产品名 **Maximo / SMAX**：公开行业术语与产品名，**一般不需脱敏**。
- 需避免的是：客户真名、真实工单/截图数据、内网地址、账号等。

---

## 9. 费用速查（Cloudflare）

| 项 | Free？ |
|----|--------|
| 子域橙云代理 | 是（正常流量） |
| 基础 DDoS | 是（随代理） |
| 有限 WAF | 是（能力有限） |
| 完整 WAF / 高级 Bot | 否（Pro+） |
| API 动态内容缓存 | **不要开**（与是否付费无关） |

AWS 侧费用另计（计算、流量、证书等）。

---

## 10. 后续 agent 建议执行顺序

1. 确认 PR #7 合并策略（含 `__pycache__` / `.gitignore` 清理是否已进 main）。
2. 在 AWS 选定并部署 Advisor；验证公网 `https://<aws-origin>/health`。
3. Cloudflare DNS 添加 `api` → AWS，**Proxy ON**；TLS Full (strict)；**Bypass cache**。
4. Pages 构建环境加 `NEXT_PUBLIC_ADVISOR_API=https://api.starlabrys.com`，重新部署前端。
5. 浏览器打开官网，测「咨询顾问」：bootstrap + 提问；确认无 CORS / 502。
6. （可选）AWS 安全组限制为 Cloudflare IP；加简单限流/监控。

---

## 11. 明确不做 / 避免

- 不在 Cloudflare Pages 上直接跑 Python advisor。
- 不对 `api.starlabrys.com` 的对话接口开 CDN 缓存。
- 不把 LLM API Key、AWS 密钥提交进 git（用环境变量 / Secrets）。
- 本地 `prod-server.mjs` 同域反代仅用于单机演示，**不是**最终生产拓扑。

---

## 12. 关键文件索引

| 路径 | 用途 |
|------|------|
| `advisor/` | Python Advisor 服务 |
| `advisor/README.md` | 本地启动与接口说明 |
| `src/components/home/site-advisor.tsx` | 前端顾问 UI + `NEXT_PUBLIC_ADVISOR_API` |
| `scripts/prod-server.mjs` | 单机静态站 + `/api` 反代（非 CF 生产） |
| `scripts/build-advisor-kb.mjs` | 从 content 生成 KB |
| `TASK-SPEC-nextjs-website.md` | 官网静态站与 Pages 原始规格 |
| 本文 `docs/DEPLOYMENT-handoff.md` | 前后端拆分与 `api.` 子域决策 |

---

*文档生成日期：2026-07-22。若架构变更，请先改本文再实施。*
