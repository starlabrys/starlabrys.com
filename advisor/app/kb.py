import json
import os
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# 简单缓存：locale -> 已加载的知识包
_pack_cache = {}


def _is_chinese_char(ch):
    return "\u4e00" <= ch <= "\u9fff"


def _tokenize(text):
    """把文字拆成小词，方便做简单匹配。"""
    text = (text or "").lower()
    parts = re.split(r"[^\w\u4e00-\u9fff]+", text, flags=re.UNICODE)
    tokens = []
    for part in parts:
        if not part:
            continue
        if part not in tokens:
            tokens.append(part)
        all_chinese = True
        for ch in part:
            if not _is_chinese_char(ch):
                all_chinese = False
                break
        if all_chinese and len(part) >= 2:
            i = 0
            while i < len(part) - 1:
                bi = part[i : i + 2]
                if bi not in tokens:
                    tokens.append(bi)
                i += 1
    return tokens


def load_pack(locale):
    """读取 kb.zh.json / kb.en.json。"""
    if locale in _pack_cache:
        return _pack_cache[locale]

    path = os.path.join(DATA_DIR, "kb." + locale + ".json")
    if not os.path.isfile(path):
        raise FileNotFoundError(
            "Knowledge pack missing: " + path + ". Run: node scripts/build-advisor-kb.mjs"
        )

    with open(path, "r", encoding="utf-8") as f:
        pack = json.load(f)

    _pack_cache[locale] = pack
    return pack


def clear_pack_cache():
    _pack_cache.clear()


def get_doc(locale, doc_id):
    pack = load_pack(locale)
    for d in pack["docs"]:
        if d.get("id") == doc_id:
            return d
    return None


def get_docs_by_ids(locale, doc_ids):
    out = []
    for doc_id in doc_ids:
        d = get_doc(locale, doc_id)
        if d is not None:
            out.append(d)
    return out


def list_projects(locale):
    pack = load_pack(locale)
    out = []
    for d in pack["docs"]:
        if d.get("type") == "project":
            out.append(d)
    return out


def allowed_hrefs(locale):
    """允许出现在回复里的站内链接。"""
    pack = load_pack(locale)
    hrefs = []
    for doc in pack["docs"]:
        url = doc.get("url")
        if url and url not in hrefs:
            hrefs.append(url)

    extras = [
        "/" + locale,
        "/" + locale + "#contact",
        "/" + locale + "#work",
        "/" + locale + "#services",
        "/" + locale + "#capabilities",
    ]
    for url in extras:
        if url not in hrefs:
            hrefs.append(url)
    return hrefs


def _count_overlap(query_tokens, doc_tokens):
    """数两边有多少相同的词（每个词只算一次）。"""
    count = 0
    for qt in query_tokens:
        found = False
        for dt in doc_tokens:
            if qt == dt:
                found = True
                break
        if found:
            count += 1
    return count


# 泛化词：单独命中不足以说明和用户问题相关
_WEAK_TOKENS = frozenset(
    [
        "分析",
        "什么",
        "是",
        "做",
        "的",
        "吗",
        "能",
        "可以",
        "如何",
        "怎么",
        "介绍",
        "看看",
        "项目",
        "案例",
        "我们",
        "你们",
        "有",
        "还",
        "与",
        "和",
        "服务",
        "接入",
        "框架",
        "analysis",
        "what",
        "does",
        "do",
        "project",
        "case",
        "the",
        "a",
        "an",
    ]
)


def _strong_overlap(query_tokens, doc_tokens):
    """数非泛化词的重叠数。"""
    count = 0
    for qt in query_tokens:
        if qt in _WEAK_TOKENS:
            continue
        found = False
        for dt in doc_tokens:
            if qt == dt:
                found = True
                break
        if found:
            count += 1
    return count


def score_doc_relevance(query, doc):
    """
    给单条文档打关联分。
    标题/标签权重大于正文，避免仅靠「分析」等泛词误命中。
    """
    q_tokens = _tokenize(query)
    if len(q_tokens) == 0:
        return {"score": 0.0, "strong": 0}

    score = 0.0
    strong = 0
    fields = [
        (doc.get("title") or "", 4.0),
        (" ".join(doc.get("tags") or []), 3.0),
        (doc.get("summary") or "", 2.0),
        (doc.get("body") or "", 1.0),
        (doc.get("id") or "", 2.0),
    ]
    for text, weight in fields:
        doc_tokens = _tokenize(text)
        overlap = _count_overlap(q_tokens, doc_tokens)
        score += overlap * weight
        strong += _strong_overlap(q_tokens, doc_tokens)

    return {"score": score, "strong": strong}


def filter_relevant_projects(query, projects, limit=2, anchor_id=None):
    """
    对候选案例做二次筛选，只保留与 query 有足够关联的结果。
    anchor_id：get_project 已命中的案例，始终保留。
    """
    if len(projects) == 0:
        return []

    scored = []
    for doc in projects:
        rel = score_doc_relevance(query, doc)
        scored.append({"doc": doc, "score": rel["score"], "strong": rel["strong"]})

    n = len(scored)
    i = 0
    while i < n:
        j = 0
        while j < n - 1 - i:
            if scored[j]["score"] < scored[j + 1]["score"]:
                tmp = scored[j]
                scored[j] = scored[j + 1]
                scored[j + 1] = tmp
            j += 1
        i += 1

    best_score = scored[0]["score"]
    threshold = max(3.0, best_score * 0.45)

    out = []
    seen = []
    if anchor_id:
        for item in scored:
            did = item["doc"].get("id")
            if did == anchor_id:
                out.append(item["doc"])
                seen.append(did)
                break

    for item in scored:
        did = item["doc"].get("id")
        if did in seen:
            continue
        if item["strong"] < 1:
            continue
        if item["score"] < threshold:
            continue
        out.append(item["doc"])
        seen.append(did)
        if len(out) >= limit:
            break

    if len(out) == 0 and len(scored) > 0 and scored[0]["strong"] >= 1:
        out.append(scored[0]["doc"])

    if len(out) > limit:
        out = out[:limit]
    return out


def retrieve(locale, query, project_slug=None, limit=6, intent=None):
    """按关键词简单打分，返回最相关的几条文档。"""
    pack = load_pack(locale)
    docs = pack["docs"]
    q_tokens = _tokenize(query)

    scored = []
    for doc in docs:
        tags = doc.get("tags") or []
        tag_text = " ".join(tags)
        hay_text = " ".join(
            [
                doc.get("id") or "",
                doc.get("title") or "",
                doc.get("summary") or "",
                doc.get("body") or "",
                tag_text,
            ]
        )
        doc_tokens = _tokenize(hay_text)
        overlap = _count_overlap(q_tokens, doc_tokens)
        score = float(overlap)

        if project_slug and doc.get("id") == "work:" + project_slug:
            score += 8

        # 不再给 project 无条件 +1.5，避免「公司」误伤抢答
        # 仅当意图明确是案例，且重叠足够时，才轻微加分
        if intent == "project" and doc.get("type") == "project" and overlap >= 2:
            score += 1.0

        if intent == "company" and doc.get("type") in ("company", "service"):
            score += 3.0
        if intent == "company" and doc.get("type") == "project":
            score -= 2.0

        if intent == "tech" and doc.get("id") == "home:scale":
            score += 5.0

        contact_words = ["contact", "email", "邮件", "联系", "咨询"]
        if doc.get("type") == "cta":
            for tw in contact_words:
                if tw in q_tokens:
                    score += 5
                    break

        if score > 0:
            scored.append({"score": score, "doc": doc})

    n = len(scored)
    i = 0
    while i < n:
        j = 0
        while j < n - 1 - i:
            if scored[j]["score"] < scored[j + 1]["score"]:
                tmp = scored[j]
                scored[j] = scored[j + 1]
                scored[j + 1] = tmp
            j += 1
        i += 1

    if len(scored) == 0:
        by_id = {}
        for d in docs:
            by_id[d["id"]] = d

        out = []
        for fid in ["home:meta", "home:hero", "home:services", "home:contact"]:
            if fid in by_id:
                out.append(by_id[fid])
        return out[:limit]

    result = []
    for item in scored[:limit]:
        result.append(item["doc"])
    return result
