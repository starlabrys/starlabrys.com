"""
阶段 0 回归：不启服务，直接测意图与规则回答。

用法（在仓库根目录或 advisor 目录）：
  python advisor/scripts/regress_phase0.py
  python scripts/regress_phase0.py
"""

from __future__ import annotations

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.chat import answer_chat  # noqa: E402
from app.config import Settings  # noqa: E402
from app.intent import detect_intent  # noqa: E402
from app.models import ChatMessage  # noqa: E402


class FakeSettings(Settings):
    advisor_llm_api_key: str = ""


def run_one(locale, text, history=None, session_id=None):
    messages = []
    if history:
        for role, content in history:
            messages.append(ChatMessage(role=role, content=content))
    messages.append(ChatMessage(role="user", content=text))
    intent = detect_intent(text, messages)

    import asyncio

    settings = FakeSettings()
    settings.advisor_llm_api_key = ""
    resp = asyncio.run(
        answer_chat(settings, locale, messages, None, session_id=session_id)
    )
    return intent, resp


def main():
    cases = [
        {
            "name": "公司介绍",
            "text": "你们公司主要做什么？",
            "expect_intent": "company",
            "must_include": ["项目交付"],
            "must_not_include": ["根据官网内容，和你问题较相关的是"],
            "expect_tools": ["search_kb"],
        },
        {
            "name": "联系",
            "text": "怎么联系你们？",
            "expect_intent": "contact",
            "must_include": ["contact@starlabrys.com"],
            "must_not_include": [],
            "expect_tools": ["draft_mailto"],
        },
        {
            "name": "技术栈",
            "text": "你们用什么技术栈？",
            "expect_intent": "tech",
            "must_include": ["Python"],
            "must_not_include": [],
            "expect_tools": ["search_kb"],
        },
        {
            "name": "路径防火墙案例",
            "text": "看看路由路径与防火墙策略项目",
            "expect_intent": "project",
            "must_include": ["防火墙"],
            "must_not_include": [],
            "expect_tools": ["get_project"],
            "session_id": "regress-path",
        },
        {
            "name": "AI 日志",
            "text": "AI 日志分析是做什么的？",
            "expect_intent": "project",
            "must_include": ["日志"],
            "must_not_include": ["防火墙", "路由路径"],
        },
        {
            "name": "微服务",
            "text": "微服务框架能接入我们的服务吗？",
            "expect_intent": "project",
            "must_include": ["微服务"],
            "must_not_include": [],
        },
        {
            "name": "英文公司介绍",
            "text": "What does Starlabrys do?",
            "locale": "en",
            "expect_intent": "company",
            "must_include": ["project"],
            "must_not_include": ["Based on the public site, these look most relevant"],
        },
        {
            "name": "英文联系",
            "text": "How can I contact you?",
            "locale": "en",
            "expect_intent": "contact",
            "must_include": ["contact@starlabrys.com"],
            "must_not_include": [],
        },
        {
            "name": "ITSM 关键词",
            "text": "有 Maximo 或 SMAX 集成经验吗？",
            "expect_intent": "project",
            "must_include": [],
            "must_not_include": [],
        },
        {
            "name": "多轮展开第一个",
            "text": "介绍第一个",
            "expect_intent": "followup",
            "session_id": "regress-path",
            "must_include": ["路由路径可视化与防火墙自动策略"],
            "must_not_include": ["根据官网内容，和你问题较相关的是"],
            "expect_tools": ["get_project"],
        },
    ]

    failed = 0
    for case in cases:
        locale = case.get("locale") or "zh"
        history = case.get("history")
        sid = case.get("session_id")
        intent, resp = run_one(locale, case["text"], history, session_id=sid)
        ok = True
        reasons = []

        if intent != case["expect_intent"]:
            ok = False
            reasons.append("intent=" + intent + " expected=" + case["expect_intent"])

        reply = resp.reply or ""
        for s in case.get("must_include") or []:
            if s not in reply:
                ok = False
                reasons.append("missing:" + s)
        for s in case.get("must_not_include") or []:
            if s and s in reply:
                ok = False
                reasons.append("unexpected:" + s)

        for t in case.get("expect_tools") or []:
            if t not in (resp.tools_used or []):
                ok = False
                reasons.append("missing_tool:" + t)

        if ok:
            print("[PASS] " + case["name"] + " tools=" + str(resp.tools_used))
        else:
            failed += 1
            print("[FAIL] " + case["name"] + " -> " + "; ".join(reasons))
            print("       tools=" + str(resp.tools_used))
            print("       reply: " + reply[:180].replace("\n", " / "))

    if failed:
        print("FAILED:", failed)
        sys.exit(1)
    print("ALL PASS:", len(cases))
    sys.exit(0)


if __name__ == "__main__":
    main()
