"""
导览 Agent：按意图选工具 → 执行（最多几步）→ 生成回复。

工具选择用规则（不靠模型乱点），简单可测。
"""

from .intent import detect_intent, followup_index
from .kb import filter_relevant_projects, get_docs_by_ids, load_pack
from .models import ChatLink, ChatResponse, MailCta
from .session_store import get_session, save_session
from . import tools as tool_fns


MAX_TOOL_STEPS = 4


def _latest_user_text(messages):
    i = len(messages) - 1
    while i >= 0:
        if messages[i].role == "user":
            return messages[i].content.strip()
        i -= 1
    return messages[-1].content.strip()


def _plan_tools(intent, user_text, locale, session, page_slug):
    """
    返回工具计划列表：[{name, args}, ...]
    最多 MAX_TOOL_STEPS 步。
    """
    plan = []

    if intent == "company":
        plan.append({"name": "search_kb", "args": {"query": user_text or "公司介绍", "locale": locale, "intent": "company"}})
    elif intent == "tech":
        plan.append({"name": "search_kb", "args": {"query": user_text or "技术栈", "locale": locale, "intent": "tech"}})
    elif intent == "contact":
        title = None
        if len(session.get("recommended_titles") or []) > 0:
            title = session["recommended_titles"][0]
        plan.append(
            {
                "name": "draft_mailto",
                "args": {
                    "locale": locale,
                    "user_need": user_text,
                    "project_title": title,
                },
            }
        )
    elif intent == "followup":
        slugs = session.get("recommended_slugs") or []
        idx = followup_index(user_text)
        slug = None
        if len(slugs) > 0:
            if idx >= len(slugs):
                idx = len(slugs) - 1
            if idx < 0:
                idx = 0
            slug = slugs[idx]
        if slug:
            plan.append({"name": "get_project", "args": {"locale": locale, "slug": slug}})
        else:
            plan.append({"name": "search_kb", "args": {"query": user_text, "locale": locale, "intent": "project"}})
    elif intent == "project":
        slug = page_slug or tool_fns.guess_project_slug(locale, user_text)
        if slug:
            plan.append({"name": "get_project", "args": {"locale": locale, "slug": slug}})
        plan.append({"name": "search_kb", "args": {"query": user_text, "locale": locale, "intent": "project"}})
    else:
        plan.append({"name": "search_kb", "args": {"query": user_text, "locale": locale, "intent": "other"}})
        # 若话里像要联系，再起草邮件
        lower = (user_text or "").lower()
        if "联系" in user_text or "邮件" in user_text or "email" in lower or "contact" in lower:
            plan.append(
                {
                    "name": "draft_mailto",
                    "args": {"locale": locale, "user_need": user_text, "project_title": None},
                }
            )

    # 截断步数
    if len(plan) > MAX_TOOL_STEPS:
        plan = plan[:MAX_TOOL_STEPS]
    return plan


def _run_one_tool(step):
    name = step.get("name")
    args = step.get("args") or {}
    if name == "search_kb":
        return tool_fns.search_kb(
            args.get("query") or "",
            args.get("locale") or "zh",
            intent=args.get("intent"),
            limit=6,
        )
    if name == "get_project":
        return tool_fns.get_project(
            args.get("locale") or "zh",
            slug=args.get("slug"),
            title_hint=args.get("title_hint"),
        )
    if name == "draft_mailto":
        return tool_fns.draft_mailto(
            args.get("locale") or "zh",
            args.get("user_need") or "",
            project_title=args.get("project_title"),
            email=args.get("email"),
        )
    return None


def _anchor_project_id(tool_results):
    """get_project 已命中的案例 id（用于二次筛选时保底保留）。"""
    for item in tool_results:
        if item.get("name") != "get_project":
            continue
        result = item.get("result")
        if isinstance(result, dict) and result.get("id"):
            return result.get("id")
    return None


def _docs_from_tool_results(tool_results):
    """把工具结果收成 hits 列表（完整文档结构）。"""
    hits = []
    seen = []
    for item in tool_results:
        name = item.get("name")
        result = item.get("result")
        if name == "search_kb" and isinstance(result, list):
            for d in result:
                did = d.get("id")
                if did and did not in seen:
                    seen.append(did)
                    hits.append(d)
        elif name == "get_project" and isinstance(result, dict) and result.get("id"):
            did = result.get("id")
            if did not in seen:
                seen.append(did)
                hits.append(result)
    return hits


def _contact_link(locale):
    if locale == "zh":
        return ChatLink(label="联系我们", href="/" + locale + "#contact")
    return ChatLink(label="Contact", href="/" + locale + "#contact")


def _build_response(locale, intent, user_text, email, hits, mailto, tools_used, session, anchor_id=None):
    links = []
    sources = []
    project_title = None

    # 收集案例，并按关联度二次筛选（避免「分析」等泛词误带出无关案例）
    raw_projects = []
    for d in hits:
        if d.get("type") == "project":
            raw_projects.append(d)
    projects = filter_relevant_projects(
        user_text,
        raw_projects,
        limit=2,
        anchor_id=anchor_id,
    )
    for d in projects:
        if d.get("url"):
            links.append(ChatLink(label=d.get("title") or d.get("url"), href=d["url"]))
        if d.get("id"):
            sources.append(d["id"])

    if intent == "followup" and len(projects) > 0:
        p = projects[0]
        project_title = p.get("title")
        body = p.get("body") or p.get("summary") or ""
        if locale == "zh":
            reply = (
                (p.get("title") or "")
                + "\n\n"
                + body
                + "\n\n若还需要，我可以帮你对照你们的场景，或起草一封联系邮件。"
            )
        else:
            reply = (
                (p.get("title") or "")
                + "\n\n"
                + body
                + "\n\nI can also map this to your scenario, or draft a contact email."
            )
    elif intent == "contact" or mailto is not None and intent == "contact":
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
        sources = ["home:contact"]
    elif intent == "company":
        company = None
        for d in hits:
            if d.get("id") in ("home:meta", "home:hero", "home:services"):
                company = d
                break
        if company is None:
            docs = get_docs_by_ids(locale, ["home:meta", "home:hero", "home:services"])
            if len(docs) > 0:
                company = docs[0]
                hits = docs
        summary = ""
        body = ""
        if company is not None:
            summary = company.get("summary") or company.get("title") or ""
            body = company.get("body") or ""
            if company.get("id"):
                sources.append(company["id"])
        if locale == "zh":
            reply = (
                summary
                + "\n"
                + body
                + "\n\n我们以项目交付为主，也可以看看精选案例，或直接联系团队。"
            )
            links.append(ChatLink(label="服务介绍", href="/" + locale + "#services"))
            links.append(ChatLink(label="精选案例", href="/" + locale + "#work"))
        else:
            reply = (
                summary
                + "\n"
                + body
                + "\n\nWe are project-delivery led — browse selected work, or contact the team."
            )
            links.append(ChatLink(label="Services", href="/" + locale + "#services"))
            links.append(ChatLink(label="Selected work", href="/" + locale + "#work"))
    elif intent == "tech":
        scale = None
        for d in hits:
            if d.get("id") == "home:scale":
                scale = d
                break
        if scale is None:
            docs = get_docs_by_ids(locale, ["home:scale"])
            if len(docs) > 0:
                scale = docs[0]
        if scale is not None:
            reply = (scale.get("summary") or "") + "\n" + (scale.get("body") or "")
            if locale == "zh":
                reply = reply + "\n\n若你有具体场景，我可以帮你对照相关案例。"
            else:
                reply = reply + "\n\nIf you share a scenario, I can map it to related case studies."
            sources.append(scale.get("id") or "home:scale")
        else:
            reply = "Python / Java / Go / Node.js — selected per project." if locale != "zh" else "我们按项目选型技术栈与中间件。"
        links.append(
            ChatLink(
                label="能力与技术" if locale == "zh" else "Capabilities",
                href="/" + locale + "#capabilities",
            )
        )
    elif len(projects) > 0:
        project_title = projects[0].get("title")
        if locale == "zh":
            lines = ["根据官网内容，和你问题较相关的是："]
            i = 0
            while i < len(projects) and i < 2:
                p = projects[i]
                lines.append("· " + (p.get("title") or "") + " — " + (p.get("summary") or ""))
                i += 1
            lines.append("需要的话可以说「介绍第一个」继续展开，或让我帮你起草联系邮件。")
            reply = "\n".join(lines)
        else:
            lines = ["Based on the public site, these look most relevant:"]
            i = 0
            while i < len(projects) and i < 2:
                p = projects[i]
                lines.append("· " + (p.get("title") or "") + " — " + (p.get("summary") or ""))
                i += 1
            lines.append('Say "tell me more about the first one" to expand, or ask me to draft an email.')
            reply = "\n".join(lines)
    else:
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

    links.append(_contact_link(locale))

    # 去重 links
    clean_links = []
    seen_href = []
    for link in links:
        if link.href in seen_href:
            continue
        seen_href.append(link.href)
        clean_links.append(link)

    if mailto is not None:
        cta = MailCta(
            email=mailto.get("email") or email,
            subject=mailto.get("subject") or "",
            body=mailto.get("body") or "",
        )
    else:
        # 默认邮件草稿
        drafted = tool_fns.draft_mailto(locale, user_text, project_title=project_title, email=email)
        cta = MailCta(email=drafted["email"], subject=drafted["subject"], body=drafted["body"])

    # 更新会话推荐
    rec_slugs = []
    rec_titles = []
    for p in projects[:3]:
        pid = p.get("id") or ""
        if pid.startswith("work:"):
            rec_slugs.append(pid.replace("work:", "", 1))
        if p.get("title"):
            rec_titles.append(p.get("title"))
    if len(rec_slugs) > 0:
        session["recommended_slugs"] = rec_slugs
        session["recommended_titles"] = rec_titles

    return ChatResponse(
        reply=(reply or "").strip(),
        links=clean_links,
        cta=cta,
        sources=sources[:8],
        mode="agent",
        tools_used=tools_used,
    )


async def run_guide_agent(settings, locale, messages, page_context=None, session_id=None):
    pack = load_pack(locale)
    email = pack.get("contactEmail") or "contact@starlabrys.com"
    user_text = _latest_user_text(messages)
    intent = detect_intent(user_text, messages)

    session = get_session(session_id)
    session["intent"] = intent

    page_slug = None
    if page_context is not None:
        page_slug = page_context.project_slug

    plan = _plan_tools(intent, user_text, locale, session, page_slug)

    tool_results = []
    tools_used = []
    mailto = None
    step_i = 0
    while step_i < len(plan) and step_i < MAX_TOOL_STEPS:
        step = plan[step_i]
        name = step.get("name")
        result = _run_one_tool(step)
        tool_results.append({"name": name, "result": result})
        tools_used.append(name)
        if name == "draft_mailto" and isinstance(result, dict):
            mailto = result
        step_i += 1

    session["steps"] = int(session.get("steps") or 0) + len(tools_used)

    hits = _docs_from_tool_results(tool_results)

    # 公司/技术短路时，若检索空则补默认文档
    if intent == "company" and len(hits) == 0:
        hits = get_docs_by_ids(locale, ["home:meta", "home:hero", "home:services"])
    if intent == "tech" and len(hits) == 0:
        hits = get_docs_by_ids(locale, ["home:scale"])

    # 案例意图：若只有 search 结果且无 project，尝试 get_project 补一刀
    if intent == "project":
        has_project = False
        for d in hits:
            if d.get("type") == "project":
                has_project = True
                break
        if not has_project and len(tools_used) < MAX_TOOL_STEPS:
            slug = tool_fns.guess_project_slug(locale, user_text)
            if slug:
                extra = tool_fns.get_project(locale, slug=slug)
                if extra is not None:
                    tool_results.append({"name": "get_project", "result": extra})
                    tools_used.append("get_project")
                    hits = [extra] + hits

    anchor_id = _anchor_project_id(tool_results)
    resp = _build_response(
        locale,
        intent,
        user_text,
        email,
        hits,
        mailto,
        tools_used,
        session,
        anchor_id=anchor_id,
    )
    save_session(session_id, session)

    # 可选：对 project/other 且配置了 LLM 时，用工具 hits 再润色
    # 为保持简单与稳定，阶段 1 默认规则组装；LLM 润色留给后续
    _ = settings
    return resp
