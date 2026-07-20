"""简单意图识别：只做关键词判断，不做复杂模型。"""


def detect_intent(user_text, messages=None):
    """
    返回之一：
    company / project / tech / contact / followup / other
    """
    text = (user_text or "").strip()
    lower = text.lower()

    # 多轮：继续介绍 / 展开第几个
    followup_keys = [
        "继续介绍",
        "展开",
        "详细说说",
        "再介绍",
        "第一个",
        "第二个",
        "第三个",
        "其中某一个",
        "上面那个",
        "这个案例",
        "tell me more",
        "more detail",
        "first one",
        "second one",
        "the first",
        "the second",
    ]
    for k in followup_keys:
        if k in text or k in lower:
            return "followup"

    contact_keys = [
        "怎么联系",
        "如何联系",
        "联系你们",
        "联系方式",
        "发邮件",
        "邮箱",
        "邮件",
        "contact",
        "email us",
        "how can i contact",
        "get in touch",
    ]
    for k in contact_keys:
        if k in text or k in lower:
            return "contact"

    # 「咨询」单独太宽，只在更像联系时用
    if "咨询" in text and ("怎么" in text or "如何" in text or "想" in text):
        return "contact"

    company_keys = [
        "你们公司主要做什么",
        "公司主要做什么",
        "你们是做什么的",
        "你们做什么",
        "公司介绍",
        "关于你们",
        "what does starlabrys do",
        "what do you do",
        "about your company",
        "who are you",
    ]
    for k in company_keys:
        if k in text or k in lower:
            return "company"

    if ("公司" in text or "company" in lower) and (
        "做什么" in text or "介绍" in text or "什么的" in text or "about" in lower
    ):
        return "company"

    tech_keys = [
        "技术栈",
        "技术",
        "中间件",
        "kafka",
        "k8s",
        "kubernetes",
        "stack",
        "tech stack",
        "用什么技术",
    ]
    for k in tech_keys:
        if k in text or k in lower:
            return "tech"

    project_keys = [
        "案例",
        "项目",
        "看看",
        "路由",
        "防火墙",
        "路径",
        "微服务",
        "日志",
        "maximo",
        "smax",
        "itsm",
        "device",
        "firewall",
        "microservice",
        "log analysis",
        "case study",
        "project",
    ]
    for k in project_keys:
        if k in text or k in lower:
            return "project"

    return "other"


def followup_index(user_text):
    """用户说第几个：0 / 1 / 2；默认 0。"""
    text = (user_text or "").strip().lower()
    if "第二" in text or "second" in text:
        return 1
    if "第三" in text or "third" in text:
        return 2
    return 0
