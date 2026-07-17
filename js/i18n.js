(() => {
  const STORAGE_KEY = "starlabrys-lang";

  const dict = {
    zh: {
      "meta.title": "Starlabrys — 以项目交付为核心的软件公司",
      "meta.description":
        "Starlabrys 专注软件项目交付：从需求到上线，为企业提供定制开发与工程落地。曾服务 du、STC 等客户。",
      "a11y.skip": "跳到主要内容",
      "a11y.home": "Starlabrys 首页",
      "a11y.menuOpen": "打开菜单",
      "a11y.menuClose": "关闭菜单",
      "lang.label": "语言",
      "nav.label": "主导航",
      "nav.services": "服务",
      "nav.capabilities": "能力",
      "nav.work": "案例",
      "nav.insights": "洞察",
      "nav.contact": "联系",
      "hero.title": "用项目，把想法做成可用的软件。",
      "hero.lede":
        "Starlabrys 是一家以项目交付为主的软件公司。我们承接定制开发与系统落地，陪客户从需求走到可运行的结果。",
      "hero.ctaPrimary": "联系我们",
      "hero.ctaSecondary": "查看案例",
      "trust.label": "客户",
      "trust.copy": "合作客户包括",
      "services.title": "我们怎么做项目",
      "services.intro":
        "不是卖标准化产品，而是按业务目标立项、设计、开发与交付——让每一期投入都对应可验收的成果。",
      "services.flagship.eyebrow": "交付方式",
      "services.flagship.title": "端到端软件项目交付",
      "services.flagship.body":
        "从调研与方案、架构与开发，到联调、上线与移交，我们按项目节奏推进，让业务方始终清楚进度与边界。",
      "services.flagship.link": "看看做过的项目",
      "cap.fw.title": "需求与方案",
      "cap.fw.body":
        "梳理业务场景与约束，把模糊目标拆成可执行的范围、里程碑与验收标准。",
      "cap.ai.title": "定制开发",
      "cap.ai.body":
        "按项目需要构建应用、接口与自动化能力，技术选型服务目标，而不是反过来。",
      "cap.ops.title": "集成与落地",
      "cap.ops.body":
        "对接现有系统与流程，完成联调、培训与移交，让成果真正进入日常使用。",
      "cap.link": "聊聊你的项目",
      "outcomes.title": "客户在合作中得到什么",
      "outcomes.intro": "我们关注可交付、可验收、可延续的结果。",
      "outcomes.a.title": "范围清晰",
      "outcomes.a.body":
        "立项时就约定目标与边界，减少中途反复，让团队把精力放在真正重要的功能上。",
      "outcomes.b.title": "按期可见",
      "outcomes.b.body":
        "用可演示的增量推进项目，进度透明，风险尽早暴露，而不是临近上线才发现偏差。",
      "outcomes.c.title": "成果可接手",
      "outcomes.c.body":
        "交付不只是代码，还包括文档、交接与必要培训，方便客户团队持续维护与演进。",
      "scale.title": "以项目为单位创造价值",
      "scale.intro": "不同行业、不同技术栈——核心始终是把项目做完、做好。",
      "scale.a.dt": "项目制",
      "scale.a.dd": "以交付结果组织合作",
      "scale.b.dt": "企业客户",
      "scale.b.dd": "含中东地区合作经验",
      "scale.c.dt": "多领域",
      "scale.c.dd": "自动化、AI 等能力按需落地",
      "work.title": "精选项目",
      "work.intro": "以下是我们交付过的部分项目，例如网络自动化与 AI 相关能力。",
      "work.du.title": "防火墙策略自动化下发",
      "work.du.body":
        "为 du 构建防火墙规则准备与自动下发流程，降低人工变更风险，提升变更可控性。",
      "work.stc.title": "AI 日志自动分析",
      "work.stc.body":
        "为 STC 构建日志分析能力，帮助团队从海量日志中更快识别异常与关键信号。",
      "work.cross.eyebrow": "项目方法",
      "work.cross.title": "把能力嵌进客户现有体系",
      "work.cross.body":
        "无论技术方向如何，我们都强调与客户现有流程、工具和团队协作方式对齐，确保项目可落地。",
      "insights.title": "项目实践笔记",
      "insights.intro": "关于立项、交付与工程落地的一线经验。",
      "insights.a.tag": "立项",
      "insights.a.title": "把模糊需求写成可验收的项目范围",
      "insights.b.tag": "交付",
      "insights.b.title": "用可演示的增量减少项目后期风险",
      "insights.c.tag": "工程",
      "insights.c.title": "定制软件项目如何顺利完成移交",
      "contact.title": "聊聊你的下一个项目",
      "contact.body":
        "无论是全新系统、流程自动化，还是 AI 能力落地，都可以从一次简短交流开始。",
      "contact.email": "发送邮件",
      "contact.explore": "了解我们怎么做",
      "footer.blurb": "以项目交付为核心的软件公司。",
      "footer.services": "服务",
      "footer.fw": "需求与方案",
      "footer.ai": "定制开发",
      "footer.ops": "集成与落地",
      "footer.company": "公司",
      "footer.legal": "法律",
      "footer.privacy": "隐私",
      "footer.terms": "条款",
      "footer.security": "安全",
    },
    en: {
      "meta.title": "Starlabrys — A project-led software company",
      "meta.description":
        "Starlabrys delivers custom software projects end to end — from discovery to launch. Past work includes engagements for clients such as du and STC.",
      "a11y.skip": "Skip to content",
      "a11y.home": "Starlabrys home",
      "a11y.menuOpen": "Open menu",
      "a11y.menuClose": "Close menu",
      "lang.label": "Language",
      "nav.label": "Primary",
      "nav.services": "Services",
      "nav.capabilities": "Capabilities",
      "nav.work": "Work",
      "nav.insights": "Insights",
      "nav.contact": "Contact",
      "hero.title": "We turn ideas into shipped software — project by project.",
      "hero.lede":
        "Starlabrys is a project-led software company. We take on custom development and system delivery, walking with clients from requirements to working results.",
      "hero.ctaPrimary": "Contact us",
      "hero.ctaSecondary": "See our work",
      "trust.label": "Clients",
      "trust.copy": "Selected clients",
      "services.title": "How we run projects",
      "services.intro":
        "We don’t sell a boxed product. We scope, design, build, and deliver against business goals — so every phase maps to something you can accept.",
      "services.flagship.eyebrow": "Delivery model",
      "services.flagship.title": "End-to-end software project delivery",
      "services.flagship.body":
        "From discovery and solution design through build, integration, launch, and handover — we move on a project cadence so stakeholders always know progress and boundaries.",
      "services.flagship.link": "See selected projects",
      "cap.fw.title": "Discovery & scoping",
      "cap.fw.body":
        "Clarify scenarios and constraints, then turn fuzzy goals into executable scope, milestones, and acceptance criteria.",
      "cap.ai.title": "Custom development",
      "cap.ai.body":
        "Build applications, APIs, and automation to fit the project — technology serves the outcome, not the other way around.",
      "cap.ops.title": "Integration & handover",
      "cap.ops.body":
        "Connect to existing systems and workflows, then finish with integration, training, and handover so the result can be used day to day.",
      "cap.link": "Talk about your project",
      "outcomes.title": "What clients get from working with us",
      "outcomes.intro": "We focus on deliverables you can accept, run, and continue.",
      "outcomes.a.title": "Clear scope",
      "outcomes.a.body":
        "Goals and boundaries are agreed up front, so teams spend energy on what matters instead of endless re-scoping.",
      "outcomes.b.title": "Visible progress",
      "outcomes.b.body":
        "We advance through demonstrable increments — progress stays transparent and risks surface early, not at the finish line.",
      "outcomes.c.title": "A handoff that sticks",
      "outcomes.c.body":
        "Delivery includes more than code: documentation, transfer, and the training needed for your team to maintain and evolve it.",
      "scale.title": "Value created one project at a time",
      "scale.intro": "Different industries, different stacks — the constant is finishing projects well.",
      "scale.a.dt": "Project-led",
      "scale.a.dd": "Engagements organized around outcomes",
      "scale.b.dt": "Enterprise",
      "scale.b.dd": "Including Middle East delivery experience",
      "scale.c.dt": "Multi-domain",
      "scale.c.dd": "Automation, AI, and more — applied as needed",
      "work.title": "Selected projects",
      "work.intro":
        "A few projects we’ve delivered — including network automation and AI capabilities among others.",
      "work.du.title": "Automated firewall policy rollout",
      "work.du.body":
        "For du, we built workflows to prepare and push firewall rules automatically — reducing manual change risk and improving control.",
      "work.stc.title": "AI-powered log analysis",
      "work.stc.body":
        "For STC, we built log analysis capabilities that help teams spot anomalies and critical signals faster in high-volume data.",
      "work.cross.eyebrow": "How we work",
      "work.cross.title": "Fitting delivery into the client’s world",
      "work.cross.body":
        "Whatever the technical domain, we align with existing processes, tools, and team practices so the project actually lands.",
      "insights.title": "Notes from delivery",
      "insights.intro": "Field lessons on scoping, shipping, and engineering handover.",
      "insights.a.tag": "Scoping",
      "insights.a.title": "Turning fuzzy needs into acceptably clear project scope",
      "insights.b.tag": "Delivery",
      "insights.b.title": "Using demoable increments to reduce late-project risk",
      "insights.c.tag": "Engineering",
      "insights.c.title": "How custom software projects hand over cleanly",
      "contact.title": "Let’s talk about your next project",
      "contact.body":
        "Whether it’s a new system, process automation, or an AI capability to land in production — it can start with a short conversation.",
      "contact.email": "Email us",
      "contact.explore": "See how we work",
      "footer.blurb": "A project-led software company.",
      "footer.services": "Services",
      "footer.fw": "Discovery & scoping",
      "footer.ai": "Custom development",
      "footer.ops": "Integration & handover",
      "footer.company": "Company",
      "footer.legal": "Legal",
      "footer.privacy": "Privacy",
      "footer.terms": "Terms",
      "footer.security": "Security",
    },
  };

  const htmlLang = { zh: "zh-CN", en: "en" };

  function t(lang, key) {
    return dict[lang]?.[key] ?? dict.zh[key] ?? key;
  }

  function applyLanguage(lang) {
    const pack = dict[lang] ? lang : "zh";
    document.documentElement.lang = htmlLang[pack];
    document.documentElement.dataset.lang = pack;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = t(pack, key);
      if (el.tagName === "TITLE") {
        document.title = value;
      } else if (el.tagName === "META") {
        el.setAttribute("content", value);
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(pack, el.getAttribute("data-i18n-aria")));
    });

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const active = btn.dataset.lang === pack;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    const toggle = document.querySelector(".nav-toggle");
    const header = document.querySelector(".site-header");
    if (toggle && header) {
      const open = header.classList.contains("is-open");
      toggle.setAttribute(
        "aria-label",
        t(pack, open ? "a11y.menuClose" : "a11y.menuOpen")
      );
    }

    try {
      localStorage.setItem(STORAGE_KEY, pack);
    } catch (_) {
      /* ignore */
    }

    window.__starlabrysLang = pack;
  }

  function init() {
    let initial = "zh";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "zh" || saved === "en") initial = saved;
    } catch (_) {
      /* ignore */
    }

    applyLanguage(initial);

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
    });
  }

  window.StarlabrysI18n = { applyLanguage, t, dict };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
