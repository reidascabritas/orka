import logging
import traceback
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.v1 import router as api_router
from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Application factory ───────────────────────────────────────────────────────

app = FastAPI(
    title="Orka API",
    description="AI Intelligence Platform",
    version="0.1.0",
    # Disable automatic OpenAPI/docs exposure in production
    docs_url=None if settings.APP_ENV == "production" else "/docs",
    redoc_url=None if settings.APP_ENV == "production" else "/redoc",
)


# ── Startup validation ────────────────────────────────────────────────────────

@app.on_event("startup")
async def validate_config() -> None:
    if settings.APP_ENV == "production":
        errors: list[str] = []
        if settings.SECRET_KEY in ("change-me", "change-me-in-production-use-at-least-32-chars"):
            errors.append("SECRET_KEY must be set to a secure value in production")
        if settings.REFRESH_TOKEN_SECRET in (
            "change-me-refresh",
            "change-me-refresh-in-production-use-at-least-32-chars",
        ):
            errors.append("REFRESH_TOKEN_SECRET must be set to a secure value in production")
        if not settings.FERNET_KEY:
            errors.append("FERNET_KEY must be set in production")
        if errors:
            raise RuntimeError(
                "Production startup validation failed:\n" + "\n".join(f"  - {e}" for e in errors)
            )


# ── Security headers middleware ───────────────────────────────────────────────

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        # Attach request_id so handlers can reference it
        request.state.request_id = request_id

        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Request-ID"] = request_id
        response.headers["Cache-Control"] = "no-store"
        # Remove server banner
        response.headers.pop("Server", None)
        return response


app.add_middleware(SecurityHeadersMiddleware)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global exception handler ─────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    # Log full traceback internally — never expose it to the client
    logger.error(
        "Unhandled exception | request_id=%s | %s",
        request_id,
        "".join(traceback.format_exception(type(exc), exc, exc.__traceback__)),
    )
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "request_id": request_id},
    )


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "app": "orka"}
