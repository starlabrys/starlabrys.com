"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Bootstrap = {
  locale: string;
  title: string;
  welcome: string;
  disclaimer: string;
  placeholder: string;
  sendLabel: string;
  openLabel: string;
  closeLabel: string;
  mailLabel: string;
  quickPrompts: string[];
  contactEmail: string;
  llmEnabled: boolean;
};

type ChatLink = { label: string; href: string };
type MailCta = {
  type: "mailto";
  email: string;
  subject: string;
  body: string;
};

type AdviseResponse = {
  reply: string;
  links?: ChatLink[];
  cta?: MailCta | null;
  sources?: string[];
  mode?: "llm" | "rules" | "agent";
  toolsUsed?: string[];
};

type Msg = {
  role: "user" | "assistant";
  content: string;
  links?: ChatLink[];
  cta?: MailCta | null;
  sourceLabels?: string[];
};

const HOME_SOURCE_LABELS: Record<string, { zh: string; en: string }> = {
  "home:meta": { zh: "官网·公司介绍", en: "Site · About" },
  "home:hero": { zh: "官网·首页", en: "Site · Home" },
  "home:services": { zh: "官网·服务", en: "Site · Services" },
  "home:contact": { zh: "官网·联系", en: "Site · Contact" },
  "home:scale": { zh: "官网·技术能力", en: "Site · Capabilities" },
  "home:capabilities": { zh: "官网·能力概览", en: "Site · Capabilities" },
  "home:capability:1": { zh: "官网·能力概览", en: "Site · Capabilities" },
  "home:work": { zh: "官网·精选案例", en: "Site · Work" },
};

function formatSourceId(id: string, locale: Locale, links?: ChatLink[]): string {
  if (id.startsWith("work:")) {
    const slug = id.slice("work:".length);
    const link = links?.find((l) => l.href.includes(slug));
    if (link?.label) return link.label;
    return slug;
  }
  const known = HOME_SOURCE_LABELS[id];
  if (known) return known[locale];
  return id;
}

function sourceLabelsFromResponse(
  sources: string[] | undefined,
  locale: Locale,
  links?: ChatLink[],
): string[] {
  if (!sources?.length) return [];
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const id of sources) {
    const label = formatSourceId(id, locale, links);
    if (seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
    if (labels.length >= 3) break;
  }
  return labels;
}

function adviseErrorMessage(
  locale: Locale,
  status: number | null,
  contactEmail: string,
): string {
  if (status === 429) {
    return locale === "zh"
      ? "请求太频繁，请稍后再试。你也可以直接发邮件到 " + contactEmail + "。"
      : "Too many requests. Please try again shortly, or email " + contactEmail + ".";
  }
  if (status !== null && status >= 500) {
    return locale === "zh"
      ? "顾问服务暂时繁忙，请稍后再试。你也可以直接发邮件到 " + contactEmail + "。"
      : "Advisor is busy right now. Please try again later, or email " + contactEmail + ".";
  }
  return locale === "zh"
    ? "顾问服务暂时不可用。你也可以直接发邮件到 " + contactEmail + "。"
    : "Advisor is temporarily unavailable. You can email " + contactEmail + ".";
}

function advisorApiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_ADVISOR_API?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "/api";
}

function mailtoOf(cta: MailCta) {
  return `mailto:${cta.email}?subject=${encodeURIComponent(cta.subject)}&body=${encodeURIComponent(cta.body)}`;
}

function sessionKey(locale: Locale) {
  return `starlabrys-advisor-sid-${locale}`;
}

function newId() {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `sid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId(locale: Locale) {
  try {
    const key = sessionKey(locale);
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = newId();
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return newId();
  }
}

export default function SiteAdvisor({
  locale,
  projectSlug,
}: {
  locale: Locale;
  projectSlug?: string;
}) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [bootError, setBootError] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [lastCta, setLastCta] = useState<MailCta | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const bootRef = useRef<Bootstrap | null>(null);
  const messagesRef = useRef<Msg[]>([]);

  useEffect(() => {
    bootRef.current = boot;
  }, [boot]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const url = `${advisorApiBase()}/v1/bootstrap?locale=${locale}`;
      console.info("[advisor] bootstrap", url);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`bootstrap ${res.status}`);
        const data = (await res.json()) as Bootstrap;
        if (!cancelled) {
          setBoot(data);
          setMessages([{ role: "assistant", content: data.welcome }]);
          setBootError(false);
        }
      } catch (err) {
        console.error("[advisor] bootstrap error", err);
        if (!cancelled) setBootError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    const currentBoot = bootRef.current;
    if (!trimmed || busyRef.current || !currentBoot) {
      console.warn("[advisor] send skipped", {
        empty: !trimmed,
        busy: busyRef.current,
        hasBoot: Boolean(currentBoot),
      });
      return;
    }

    const nextMessages: Msg[] = [
      ...messagesRef.current,
      { role: "user", content: trimmed },
    ];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setInput("");
    busyRef.current = true;
    setBusy(true);

    const url = `${advisorApiBase()}/v1/advise`;
    console.info("[advisor] posting", url);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          sessionId: getSessionId(locale),
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          pageContext: {
            path:
              typeof window !== "undefined" ? window.location.pathname : null,
            projectSlug: projectSlug || null,
          },
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error("[advisor] advise failed", res.status, detail);
        throw new Error(`advise ${res.status}`);
      }
      const raw = (await res.json()) as AdviseResponse & { tools_used?: string[] };
      const data: AdviseResponse = {
        ...raw,
        toolsUsed: raw.toolsUsed ?? raw.tools_used,
      };
      const sourceLabels = sourceLabelsFromResponse(data.sources, locale, data.links);
      setLastCta(data.cta ?? null);
      setMessages((prev) => {
        const updated: Msg[] = [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            links: data.links,
            cta: data.cta,
            sourceLabels: sourceLabels.length > 0 ? sourceLabels : undefined,
          },
        ];
        messagesRef.current = updated;
        return updated;
      });
    } catch (err) {
      console.error("[advisor] advise error", err);
      const status =
        err instanceof Error && /^advise (\d+)$/.test(err.message)
          ? Number(err.message.replace("advise ", ""))
          : null;
      const fallback = adviseErrorMessage(locale, status, currentBoot.contactEmail);
      setMessages((prev) => {
        const updated: Msg[] = [...prev, { role: "assistant", content: fallback }];
        messagesRef.current = updated;
        return updated;
      });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  if (bootError && !boot) {
    return (
      <div className="fixed right-4 bottom-4 z-[60] md:right-6 md:bottom-6">
        <p className="max-w-[14rem] rounded-sm border border-home-line bg-home-white px-3 py-2 text-[0.8rem] text-home-slate shadow-lg">
          {locale === "zh"
            ? "顾问暂不可用，请刷新页面或稍后再试。"
            : "Advisor unavailable. Refresh or try again later."}
        </p>
      </div>
    );
  }

  const prompts = boot?.quickPrompts ?? [];

  return (
    <div className="fixed right-4 bottom-4 z-[60] flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      {open && boot ? (
        <section
          id={panelId}
          aria-label={boot.title}
          className="flex h-[min(34rem,70vh)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-sm border border-home-line bg-home-white text-home-ink shadow-[0_20px_50px_rgba(14,22,24,0.22)]"
        >
          <header className="flex items-start justify-between gap-3 border-b border-home-line bg-home-ink px-4 py-3 text-home-white">
            <div>
              <p className="font-display text-[1.05rem] font-bold">{boot.title}</p>
              <p className="mt-1 text-[0.75rem] text-white/65">{boot.disclaimer}</p>
            </div>
            <button
              type="button"
              className="rounded-sm px-2 py-1 text-[0.85rem] text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
            >
              {boot.closeLabel}
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`max-w-[95%] rounded-sm px-3 py-2 text-[0.92rem] leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-home-teal text-home-white"
                    : "bg-home-mist text-home-ink"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.links && m.links.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {m.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="font-semibold text-home-teal underline-offset-2 hover:underline"
                        >
                          {link.label} →
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {m.sourceLabels && m.sourceLabels.length > 0 ? (
                  <p className="mt-2 border-t border-home-line/70 pt-2 text-[0.72rem] text-home-slate">
                    {locale === "zh" ? "依据：" : "Based on: "}
                    {m.sourceLabels.join(locale === "zh" ? "、" : ", ")}
                  </p>
                ) : null}
              </div>
            ))}
            {busy ? (
              <p className="text-[0.85rem] text-home-slate">
                {locale === "zh" ? "思考中…" : "Thinking…"}
              </p>
            ) : null}
          </div>

          <div className="border-t border-home-line px-3 py-2">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {prompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    void send(q);
                  }}
                  className="max-w-full rounded-sm border border-home-line bg-home-paper px-2 py-1 text-left text-[0.75rem] text-home-slate hover:border-home-teal hover:text-home-teal disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
            {lastCta ? (
              <a
                href={mailtoOf(lastCta)}
                className="mb-2 inline-flex min-h-9 w-full items-center justify-center rounded-sm bg-home-teal px-3 text-[0.9rem] font-semibold text-home-white hover:bg-home-teal-deep"
              >
                {boot.mailLabel}
              </a>
            ) : null}
            {/* No <form>: native GET submit was reloading the page instead of calling the API. */}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder={boot.placeholder}
                disabled={busy}
                className="min-w-0 flex-1 rounded-sm border border-home-line bg-home-white px-3 py-2 text-[0.9rem] outline-none focus:border-home-teal"
              />
              <button
                type="button"
                disabled={busy || !input.trim()}
                onClick={() => {
                  void send(input);
                }}
                className="rounded-sm bg-home-ink px-3 py-2 text-[0.9rem] font-semibold text-home-white hover:bg-home-ink-soft disabled:opacity-50"
              >
                {boot.sendLabel}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-12 items-center justify-center rounded-sm bg-home-teal px-4 text-[0.95rem] font-semibold text-home-white shadow-lg hover:bg-home-teal-deep"
      >
        {boot?.openLabel || (locale === "zh" ? "咨询顾问" : "Ask advisor")}
      </button>
    </div>
  );
}
