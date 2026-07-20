"""导览只读工具：普通函数，供 Agent 调用。"""

from .kb import get_doc, list_projects, load_pack, retrieve


def search_kb(query, locale, intent=None, limit=6):
    """搜官网知识包，返回精简文档列表。"""
    docs = retrieve(locale, query, limit=limit, intent=intent)
    out = []
    for d in docs:
        out.append(
            {
                "id": d.get("id"),
                "type": d.get("type"),
                "title": d.get("title"),
                "summary": d.get("summary"),
                "body": d.get("body"),
                "url": d.get("url"),
            }
        )
    return out


def get_project(locale, slug=None, title_hint=None):
    """
    按 slug 或标题关键词取一个案例全文。
    slug 例：device-config-rollout
    """
    if slug:
        doc = get_doc(locale, "work:" + slug)
        if doc is not None:
            return {
                "id": doc.get("id"),
                "type": doc.get("type"),
                "title": doc.get("title"),
                "summary": doc.get("summary"),
                "body": doc.get("body"),
                "url": doc.get("url"),
                "slug": slug,
            }

    hint = (title_hint or "").strip().lower()
    if not hint:
        return None

    projects = list_projects(locale)
    # 先精确包含标题
    for p in projects:
        title = (p.get("title") or "").lower()
        if hint in title or title in hint:
            pid = p.get("id") or ""
            slug_val = pid.replace("work:", "") if pid.startswith("work:") else pid
            return {
                "id": p.get("id"),
                "type": p.get("type"),
                "title": p.get("title"),
                "summary": p.get("summary"),
                "body": p.get("body"),
                "url": p.get("url"),
                "slug": slug_val,
            }

    # 再按 tags / 正文粗匹配
    for p in projects:
        tags = p.get("tags") or []
        blob = " ".join(tags) + " " + (p.get("summary") or "") + " " + (p.get("title") or "")
        blob = blob.lower()
        if hint in blob:
            pid = p.get("id") or ""
            slug_val = pid.replace("work:", "") if pid.startswith("work:") else pid
            return {
                "id": p.get("id"),
                "type": p.get("type"),
                "title": p.get("title"),
                "summary": p.get("summary"),
                "body": p.get("body"),
                "url": p.get("url"),
                "slug": slug_val,
            }
    return None


def draft_mailto(locale, user_need, project_title=None, email=None):
    """只生成邮件草稿，不发送。"""
    pack = load_pack(locale)
    if not email:
        email = pack.get("contactEmail") or "contact@starlabrys.com"

    need = (user_need or "").strip()
    if locale == "zh":
        if project_title:
            subject = "咨询：" + project_title
        else:
            subject = "项目咨询 — Starlabrys 官网"
        body = (
            "你好，Starlabrys 团队：\n\n"
            "我在官网上了解了你们的服务，想进一步沟通。\n\n"
            "需求/场景：" + need + "\n\n"
            "期待回复，谢谢。"
        )
    else:
        if project_title:
            subject = "Inquiry: " + project_title
        else:
            subject = "Project inquiry — Starlabrys website"
        body = (
            "Hello Starlabrys team,\n\n"
            "I learned about your services on the website and would like to talk further.\n\n"
            "Need / context: " + need + "\n\n"
            "Looking forward to hearing from you."
        )

    return {
        "email": email,
        "subject": subject,
        "body": body,
    }


def guess_project_slug(locale, user_text):
    """从用户话里猜案例 slug（没有则 None）。"""
    text = (user_text or "").lower()
    mapping = [
        ("device-config-rollout", ["路由", "防火墙", "路径", "firewall", "route-path", "route path"]),
        ("ai-log-analysis", ["日志", "log", "ai 日志", "ai-log"]),
        ("python-microservices", ["微服务", "microservice", "kong"]),
    ]
    for slug, keys in mapping:
        for k in keys:
            if k in text:
                return slug
    # 标题命中
    hit = get_project(locale, title_hint=user_text)
    if hit is not None:
        return hit.get("slug")
    return None
