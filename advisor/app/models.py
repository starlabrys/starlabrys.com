from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"] = "user"
    content: str = Field(min_length=1, max_length=4000)


class PageContext(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    path: str | None = None
    project_slug: str | None = Field(default=None, alias="projectSlug")


class ChatRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    locale: Literal["zh", "en"] = "zh"
    session_id: str | None = Field(default=None, alias="sessionId")
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)
    page_context: PageContext | None = Field(default=None, alias="pageContext")


class ChatLink(BaseModel):
    label: str
    href: str


class MailCta(BaseModel):
    type: Literal["mailto"] = "mailto"
    email: str
    subject: str
    body: str


class ChatResponse(BaseModel):
    reply: str
    links: list[ChatLink] = []
    cta: MailCta | None = None
    sources: list[str] = []
    mode: Literal["llm", "rules", "agent"] = "rules"
    tools_used: list[str] = []


class BootstrapResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    locale: str
    title: str
    welcome: str
    disclaimer: str
    placeholder: str
    send_label: str = Field(alias="sendLabel")
    open_label: str = Field(alias="openLabel")
    close_label: str = Field(alias="closeLabel")
    mail_label: str = Field(alias="mailLabel")
    quick_prompts: list[str] = Field(alias="quickPrompts")
    contact_email: str = Field(alias="contactEmail")
    llm_enabled: bool = Field(alias="llmEnabled")
