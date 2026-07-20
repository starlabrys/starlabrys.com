from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware

from .chat import answer_chat
from .config import get_settings
from .kb import load_pack
from .models import BootstrapResponse, ChatRequest, ChatResponse
from .rate_limit import RateLimiter, client_key

settings = get_settings()
limiter = RateLimiter(settings.advisor_rate_limit_per_minute)

app = FastAPI(title="Starlabrys Advisor API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/v1/bootstrap", response_model=BootstrapResponse)
def bootstrap(locale: str = Query(default="zh", pattern="^(zh|en)$")):
    pack = load_pack(locale)
    b = pack["bootstrap"]
    return BootstrapResponse(
        locale=locale,
        title=b["title"],
        welcome=b["welcome"],
        disclaimer=b["disclaimer"],
        placeholder=b["placeholder"],
        sendLabel=b["sendLabel"],
        openLabel=b["openLabel"],
        closeLabel=b["closeLabel"],
        mailLabel=b["mailLabel"],
        quickPrompts=b["quickPrompts"],
        contactEmail=pack["contactEmail"],
        llmEnabled=bool(settings.advisor_llm_api_key),
    )


@app.post("/v1/advise", response_model=ChatResponse)
@app.post("/v1/agent", response_model=ChatResponse)
@app.post("/v1/chat", response_model=ChatResponse, include_in_schema=False)
async def chat(payload: ChatRequest, request: Request):
    limiter.check(client_key(request))
    return await answer_chat(
        settings,
        locale=payload.locale,
        messages=payload.messages,
        page_context=payload.page_context,
        session_id=payload.session_id,
    )
