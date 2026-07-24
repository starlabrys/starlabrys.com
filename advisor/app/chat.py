import json

import httpx

from .config import Settings
from .intent import detect_intent, followup_index
from .kb import (
    allowed_hrefs,
    get_docs_by_ids,
    list_projects,
    load_pack,
    retrieve,
)
from .models import ChatLink, ChatResponse, MailCta, PageContext


def _latest_user_text(messages):
    i = len(messages) - 1
    while i >= 0:
        if messages[i].role == "user":
            return messages[i].content.strip()
        i -= 1
    return messages[-1].content.strip()


def _last_assistant_text(messages):
    i = len(messages) - 1
    while i >= 0:
        if messages[i].role == "assistant":
            return messages[i].content or ""
        i -= 1
    return ""


def _mail_cta(locale, email, user_text, project_title):
    if locale == "zh":
        if project_title:
            subject = "咨询：" + project_title
        else:
            subject = "项目咨询 — Starlabrys 官网"
        body = (
            "你好，Starlabrys 团队：\n\n"
            "我在官网上了解了你们的服务，想进一步沟通。\n\n"
            "需求/场景：" + user_text + "\n\n"
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
            "Need / context: " + user_text + "\n\n"
            "Looking forward to hearing from you."
        )
    return MailCta(email=email, subject=subject, body=body)


def _filter_links(locale, links):
    allow = allowed_hrefs(locale)
    out = []
    seen = []
    for link in links:
        href = link.href.strip()
        if href not in allow:
            continue
        if href in seen:
            continue
        seen.append(href)
        label = link.label.strip()
        if not label:
            label = href
        out.append(ChatLink(label=label, href=href))
    return out


def _find_projects(hits):
    projects = []
    for d in hits:
        if d.get("type") == "project":
            projects.append(d)
    return projects


def _find_company(hits):
    company_ids = ["home:meta", "home:hero", "home:services"]
    for d in hits:
        if d.get("id") in company_ids:
            return d
    return None


def _find_scale(hits):
    for d in hits:
        if d.get("id") == "home:scale":
            return d
    return None


def _projects_mentioned_in_text(locale, text):
    """从上一条助手回复里，找出提到过的案例（按官网案例标题匹配）。"""
    found = []
    projects = list_projects(locale)
    for p in projects:
        title = p.get("title") or ""
        if title and title in text:
            found.append(p)
    return found


def _contact_links(locale):
    if locale == "zh":
        return [ChatLink(label="联系我们", href="/" + locale + "#contact")]
    return [ChatLink(label="Contact", href="/" + locale + "#contact")]


def _sources_from_hits(hits):
    sources = []
    i = 0
    while i < len(hits) and i < 6:
        sources.append(hits[i]["id"])
        i += 1
    return sources


def _reply_company(locale, hits, email, user_text):
    company = _find_company(hits)
    if company is None:
        docs = get_docs_by_ids(locale, ["home:meta", "home:hero", "home:services"])
        if len(docs) > 0:
            company = docs[0]
            hits = docs

    links = [
        ChatLink(label="服务介绍" if locale == "zh" else "Services", href="/" + locale + "#services"),
        ChatLink(label="精选案例" if locale == "zh" else "Selected work", href="/" + locale + "#work"),
    ]
    links = links + _contact_links(locale)

    if locale == "zh":
        summary = ""
        body = ""
        if company is not None:
            summary = company.get("summary") or company.get("title") or ""
            body = company.get("body") or ""
        reply = (
            summary
            + "\n"
            + body
            + "\n\n我们以项目交付为主，也可以看看精选案例，或直接联系团队。"
        )
    else:
        summary = ""
        body = ""
        if company is not None:
            summary = company.get("summary") or company.get("title") or ""
            body = company.get("body") or ""
        reply = (
            summary
            + "\n"
            + body
            + "\n\nWe are project-delivery led — browse selected work, or contact the team."
        )

    return ChatResponse(
        reply=reply.strip(),
        links=_filter_links(locale, links),
        cta=_mail_cta(locale, email, user_text, None),
        sources=_sources_from_hits(hits if hits else get_docs_by_ids(locale, ["home:meta"])),
        mode="rules",
    )


def _reply_contact(locale, email, user_text):
    hits = get_docs_by_ids(locale, ["home:contact"])
    if locale == "zh":
        reply = (
            "欢迎联系我们：" + email + "。你也可以使用下方「发邮件联系」，"
            "我会把你刚才描述的场景放进邮件草稿，方便直接发送。"
        )
    else:
        reply = (
            "You can email " + email + ', or use "Email us" below — '
            "I can draft a short note from what you just described."
        )
    return ChatResponse(
        reply=reply,
        links=_filter_links(locale, _contact_links(locale)),
        cta=_mail_cta(locale, email, user_text, None),
        sources=_sources_from_hits(hits),
        mode="rules",
    )


def _reply_tech(locale, hits, email, user_text):
    scale = _find_scale(hits)
    if scale is None:
        docs = get_docs_by_ids(locale, ["home:scale"])
        if len(docs) > 0:
            scale = docs[0]
            hits = docs

    links = [
        ChatLink(label="能力与技术" if locale == "zh" else "Capabilities", href="/" + locale + "#capabilities"),
    ]
    links = links + _contact_links(locale)

    if scale is not None:
        reply = (
            (scale.get("summary") or "")
            + "\n"
            + (scale.get("body") or "")
        )
        if locale == "zh":
            reply = reply + "\n\n若你有具体场景，我可以帮你对照相关案例。"
        else:
            reply = reply + "\n\nIf you share a scenario, I can map it to related case studies."
    else:
        if locale == "zh":
            reply = "我们按项目选型技术栈与中间件。你可以问具体案例，或直接联系团队。"
        else:
            reply = "We choose stacks per project. Ask about a case study, or contact the team."

    return ChatResponse(
        reply=reply.strip(),
        links=_filter_links(locale, links),
        cta=_mail_cta(locale, email, user_text, None),
        sources=_sources_from_hits(hits),
        mode="rules",
    )


def _reply_projects(locale, hits, email, user_text):
    projects = _find_projects(hits)
    links = []
    i = 0
    while i < len(projects) and i < 2:
        p = projects[i]
        if p.get("url"):
            links.append(ChatLink(label=p["title"], href=p["url"]))
        i += 1
    links = links + _contact_links(locale)

    project_title = None
    if len(projects) > 0:
        project_title = projects[0]["title"]

    if len(projects) == 0:
        if locale == "zh":
            reply = (
                "我可以介绍官网精选案例，例如路由路径与防火墙策略、AI 日志分析、Python 微服务框架。"
                "你想先看哪一个？"
            )
        else:
            reply = (
                "I can walk you through selected case studies — route-path firewall policy, "
                "AI log analysis, or the Python microservices framework. Which one first?"
            )
        return ChatResponse(
            reply=reply,
            links=_filter_links(locale, links),
            cta=_mail_cta(locale, email, user_text, None),
            sources=_sources_from_hits(hits),
            mode="rules",
        )

    if locale == "zh":
        lines = ["根据官网内容，和你问题较相关的是："]
        i = 0
        while i < len(projects) and i < 2:
            p = projects[i]
            summary = p.get("summary") or ""
            lines.append("· " + p["title"] + " — " + summary)
            i += 1
        lines.append("需要的话可以说「介绍第一个」继续展开，或让我帮你起草联系邮件。")
        reply = "\n".join(lines)
    else:
        lines = ["Based on the public site, these look most relevant:"]
        i = 0
        while i < len(projects) and i < 2:
            p = projects[i]
            summary = p.get("summary") or ""
            lines.append("· " + p["title"] + " — " + summary)
            i += 1
        lines.append('Say "tell me more about the first one" to expand, or ask me to draft an email.')
        reply = "\n".join(lines)

    return ChatResponse(
        reply=reply.strip(),
        links=_filter_links(locale, links),
        cta=_mail_cta(locale, email, user_text, project_title),
        sources=_sources_from_hits(hits),
        mode="rules",
    )


def _reply_followup(locale, messages, email, user_text):
    last = _last_assistant_text(messages)
    mentioned = _projects_mentioned_in_text(locale, last)
    if len(mentioned) == 0:
        # 没有上文案例时，退回案例列表
        hits = list_projects(locale)[:2]
        return _reply_projects(locale, hits, email, user_text)

    idx = followup_index(user_text)
    if idx < 0:
        idx = 0
    if idx >= len(mentioned):
        idx = len(mentioned) - 1
    project = mentioned[idx]

    links = []
    if project.get("url"):
        links.append(ChatLink(label=project["title"], href=project["url"]))
    links = links + _contact_links(locale)

    body = project.get("body") or project.get("summary") or ""
    if locale == "zh":
        reply = (
            (project.get("title") or "")
            + "\n\n"
            + body
            + "\n\n若还需要，我可以帮你对照你们的场景，或起草一封联系邮件。"
        )
    else:
        reply = (
            (project.get("title") or "")
            + "\n\n"
            + body
            + "\n\nI can also map this to your scenario, or draft a contact email."
        )

    return ChatResponse(
        reply=reply.strip(),
        links=_filter_links(locale, links),
        cta=_mail_cta(locale, email, user_text, project.get("title")),
        sources=[project.get("id")],
        mode="rules",
    )


def _reply_fallback(locale, email, user_text):
    if locale == "zh":
        reply = (
            "我主要依据官网公开内容回答。你可以问服务方式、技术栈，或某个精选案例；"
            "也可以发邮件到 " + email + " 与人工沟通。"
        )
    else:
        reply = (
            "I answer from public website content. Ask about how we work, our stack, "
            "or a case study — or email " + email + "."
        )
    return ChatResponse(
        reply=reply,
        links=_filter_links(locale, _contact_links(locale)),
        cta=_mail_cta(locale, email, user_text, None),
        sources=[],
        mode="rules",
    )


def _rules_by_intent(locale, intent, user_text, hits, email, messages):
    if intent == "contact":
        return _reply_contact(locale, email, user_text)
    if intent == "company":
        return _reply_company(locale, hits, email, user_text)
    if intent == "tech":
        return _reply_tech(locale, hits, email, user_text)
    if intent == "followup":
        return _reply_followup(locale, messages, email, user_text)
    if intent == "project":
        return _reply_projects(locale, hits, email, user_text)
    # other：有案例命中就按案例，否则公司，再否则兜底
    if len(_find_projects(hits)) > 0:
        return _reply_projects(locale, hits, email, user_text)
    if _find_company(hits) is not None:
        return _reply_company(locale, hits, email, user_text)
    return _reply_fallback(locale, email, user_text)


async def _llm_reply(settings, locale, messages, hits, email, user_text, intent):
    if not settings.advisor_llm_api_key:
        return None

    snippets = []
    for d in hits:
        snippets.append(
            {
                "id": d.get("id"),
                "type": d.get("type"),
                "title": d.get("title"),
                "summary": d.get("summary"),
                "url": d.get("url"),
            }
        )
    kb_blob = json.dumps(snippets, ensure_ascii=False, indent=2)

    allow = allowed_hrefs(locale)
    allow_text = ", ".join(allow)

    if locale == "zh":
        lang_line = "Respond in Chinese."
    else:
        lang_line = "Respond in English."

    system = (
        "You are the Starlabrys website project advisor.\n"
        "Locale: " + locale + "\n"
        "Detected intent: " + intent + "\n"
        "Rules:\n"
        "- Answer ONLY using the knowledge snippets provided.\n"
        "- Do not invent clients, pricing, SLAs, or unlisted capabilities.\n"
        "- If unsure, say so and suggest emailing " + email + ".\n"
        "- Prefer concise answers (under 120 words).\n"
        "- When helpful, recommend at most 2 case study links from the allowed href list.\n"
        "- End by gently offering email contact when the user has a real project need.\n"
        "- If intent is company, explain what the company does; do not digress into a single unrelated case.\n"
        "- " + lang_line + "\n\n"
        "Return STRICT JSON with keys:\n"
        "reply (string),\n"
        "links (array of {label, href}),\n"
        "mail_subject (string),\n"
        "mail_body (string),\n"
        "sources (array of knowledge ids you used).\n\n"
        "Allowed hrefs: " + allow_text + "\n"
        "Knowledge snippets:\n"
        + kb_blob
    )

    chat_messages = [{"role": "system", "content": system}]
    start = 0
    if len(messages) > 8:
        start = len(messages) - 8
    i = start
    while i < len(messages):
        m = messages[i]
        if m.role != "system":
            chat_messages.append({"role": m.role, "content": m.content})
        i += 1

    url = settings.advisor_llm_base_url.rstrip("/") + "/chat/completions"
    headers = {
        "Authorization": "Bearer " + settings.advisor_llm_api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.advisor_llm_model,
        "temperature": 0.3,
        "max_tokens": 500,
        "response_format": {"type": "json_object"},
        "messages": chat_messages,
    }

    try:
        async with httpx.AsyncClient(timeout=settings.advisor_llm_timeout_seconds) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
    except Exception:
        return None

    raw_links = parsed.get("links") or []
    parsed_links = []
    for x in raw_links:
        if not isinstance(x, dict):
            continue
        label = str(x.get("label") or "")
        href = str(x.get("href") or "")
        parsed_links.append(ChatLink(label=label, href=href))
    links = _filter_links(locale, parsed_links)

    if len(links) == 0:
        for d in hits:
            if d.get("type") == "project" and d.get("url"):
                links.append(ChatLink(label=d["title"], href=d["url"]))
                if len(links) >= 2:
                    break

    project_title = None
    for d in hits:
        if d.get("type") == "project":
            project_title = d["title"]
            break

    subject = str(parsed.get("mail_subject") or "").strip()
    body = str(parsed.get("mail_body") or "").strip()
    if subject and body:
        cta = MailCta(email=email, subject=subject, body=body)
    else:
        cta = _mail_cta(locale, email, user_text, project_title)

    sources = parsed.get("sources")
    if not sources:
        sources = []
        for d in hits:
            sources.append(d["id"])

    clean_sources = []
    i = 0
    while i < len(sources) and i < 8:
        clean_sources.append(str(sources[i]))
        i += 1

    reply = str(parsed.get("reply") or "").strip()
    if not reply:
        return None

    return ChatResponse(
        reply=reply,
        links=links,
        cta=cta,
        sources=clean_sources,
        mode="llm",
    )


def _build_hits(locale, intent, user_text, slug):
    """按意图准备检索结果；公司/联系/技术走短路文档。"""
    if intent == "company":
        return get_docs_by_ids(locale, ["home:meta", "home:hero", "home:services"])
    if intent == "contact":
        return get_docs_by_ids(locale, ["home:contact", "home:meta"])
    if intent == "tech":
        return get_docs_by_ids(locale, ["home:scale", "home:capability:1"])
    if intent == "followup":
        return list_projects(locale)[:3]

    query = user_text
    if slug:
        query = user_text + " " + slug
    return retrieve(locale, query, project_slug=slug, limit=6, intent=intent)


async def answer_chat(
    settings: Settings,
    locale,
    messages,
    page_context: PageContext | None,
    session_id=None,
):
    """对外入口：走导览 Agent（工具化）。"""
    from .agent import run_guide_agent

    return await run_guide_agent(
        settings,
        locale,
        messages,
        page_context=page_context,
        session_id=session_id,
    )
