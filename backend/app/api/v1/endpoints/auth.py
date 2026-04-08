from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from jose import jwt, JWTError
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_event
from app.core.config import settings
from app.core.deps import get_current_user, bearer
from app.core.security import (
    blacklist_token,
    create_access_token,
    create_refresh_token,
    hash_password,
    validate_password_strength,
    verify_password,
)
from app.db.base import get_db
from app.models.user import Organization, User, UserOrganization

router = APIRouter()

# ── Rate-limit state (in-memory) ─────────────────────────────────────────────
# { email: {"failures": int, "locked_until": datetime | None} }
_login_attempts: dict[str, dict] = {}

_MAX_FAILURES = 5
_LOCKOUT_MINUTES = 15


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(email: str) -> None:
    """Raise 429 if the account is currently locked out."""
    entry = _login_attempts.get(email)
    if not entry:
        return
    locked_until = entry.get("locked_until")
    if locked_until and datetime.now(timezone.utc) < locked_until:
        remaining = int((locked_until - datetime.now(timezone.utc)).total_seconds())
        raise HTTPException(
            status_code=429,
            detail=f"Conta bloqueada por excesso de tentativas. Tente novamente em {remaining}s.",
        )
    # If lockout has expired, reset the entry
    if locked_until and datetime.now(timezone.utc) >= locked_until:
        _login_attempts.pop(email, None)


def _record_failure(email: str) -> None:
    entry = _login_attempts.setdefault(email, {"failures": 0, "locked_until": None})
    entry["failures"] += 1
    if entry["failures"] >= _MAX_FAILURES:
        entry["locked_until"] = datetime.now(timezone.utc) + timedelta(minutes=_LOCKOUT_MINUTES)


def _reset_failures(email: str) -> None:
    _login_attempts.pop(email, None)


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    email: EmailStr
    password: str
    org_name: str


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    refresh_token: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", status_code=201)
async def register(data: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    ip = _get_client_ip(request)

    # Password strength
    errors = validate_password_strength(data.password)
    if errors:
        log_event("auth.register", None, None, ip, "failure", {"reason": errors, "email": data.email})
        raise HTTPException(status_code=422, detail=errors)

    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        log_event("auth.register", None, None, ip, "failure", {"reason": "email_exists", "email": data.email})
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    org = Organization(name=data.org_name)
    db.add(org)
    user = User(name=data.name, email=data.email, password_hash=hash_password(data.password))
    db.add(user)
    await db.flush()
    db.add(UserOrganization(user_id=user.id, organization_id=org.id, role="admin"))
    await db.commit()

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    log_event("auth.register", str(user.id), str(org.id), ip, "success")
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/login")
async def login(data: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    ip = _get_client_ip(request)

    # Rate-limit check (before DB query to avoid timing oracle)
    _check_rate_limit(data.email)

    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        _record_failure(data.email)
        log_event(
            "auth.login",
            str(user.id) if user else None,
            None,
            ip,
            "failure",
            {"reason": "invalid_credentials", "email": data.email},
        )
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    _reset_failures(data.email)

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    log_event("auth.login", str(user.id), None, ip, "success")
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/refresh")
async def refresh_token(data: RefreshRequest, request: Request):
    ip = _get_client_ip(request)
    try:
        payload = jwt.decode(data.refresh_token, settings.REFRESH_TOKEN_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        token_type: str | None = payload.get("type")

        if not user_id or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Refresh token inválido")

    except JWTError:
        log_event("auth.refresh", None, None, ip, "failure", {"reason": "invalid_token"})
        raise HTTPException(status_code=401, detail="Refresh token inválido ou expirado")

    new_access = create_access_token(user_id)
    log_event("auth.refresh", user_id, None, ip, "success")
    return {"access_token": new_access, "token_type": "bearer"}


@router.post("/logout")
async def logout(
    request: Request,
    credentials=Depends(bearer),
):
    ip = _get_client_ip(request)
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=["HS256"])
        jti: str | None = payload.get("jti")
        user_id: str | None = payload.get("sub")
        exp_ts = payload.get("exp")

        if jti and exp_ts:
            exp_dt = datetime.fromtimestamp(exp_ts, tz=timezone.utc)
            blacklist_token(jti, exp_dt)

        log_event("auth.logout", user_id, None, ip, "success", {"jti": jti})
    except JWTError:
        # Token already invalid — still return success so the client can clean up
        pass

    return {"detail": "Logout realizado com sucesso"}


@router.get("/me")
async def me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UserOrganization).where(UserOrganization.user_id == current_user.id)
    )
    uo = result.scalar_one_or_none()
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "organization_id": str(uo.organization_id) if uo else None,
        "role": uo.role if uo else None,
    }
