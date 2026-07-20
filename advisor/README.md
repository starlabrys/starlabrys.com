# Starlabrys Advisor API

只读官网内容的项目顾问后端（FastAPI）。

Python：**3.11+**，本地用 [uv](https://docs.astral.sh/uv/) 管理；版本钉在 `.python-version`（当前为最新稳定 **3.14**）。

## 准备

```bash
# 仓库根目录：生成知识包
npm run advisor:kb

# 安装 / 同步 Python（会按 .python-version 下载解释器）
uv python install --directory advisor
uv sync --directory advisor
```

可选：复制根目录 `.env.example` 为 `advisor/.env`，填入 `ADVISOR_LLM_API_KEY`。不填则走规则检索模式，也能演示。

## 启动

两个终端分别启动：

```bash
# 终端 1：后端（task api 内会 uv python install + uv sync）
task api

# 终端 2：前端（已指向 http://127.0.0.1:30001）
task ui
```

健康检查：http://127.0.0.1:30001/health  
Bootstrap：http://127.0.0.1:30001/v1/bootstrap?locale=zh  

打开 `/zh`，右下角「咨询顾问」。

## 接口

- `GET /v1/bootstrap?locale=zh|en`
- `POST /v1/chat` — body: `{ locale, sessionId?, messages, pageContext? }`
