import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from cryptography.fernet import Fernet
from jose import jwt

from app.core.config import settings

# ── Token blacklist (in-memory, jti-based) ───────────────────────────────────
# Maps jti -> expiry datetime (UTC). Expired entries are pruned on each write.
_token_blacklist: dict[str, datetime] = {}


def _prune_blacklist() -> None:
    """Remove expired entries to prevent unbounded memory growth."""
    now = datetime.now(timezone.utc)
    expired = [jti for jti, exp in _token_blacklist.items() if exp <= now]
    for jti in expired:
        del _token_blacklist[jti]


def blacklist_token(jti: str, exp: datetime) -> None:
    _prune_blacklist()
    _token_blacklist[jti] = exp


def is_token_blacklisted(jti: str) -> bool:
    _prune_blacklist()
    return jti in _token_blacklist


# ── Fernet (integration token encryption) ───────────────────────────────────

def _build_fernet() -> Fernet:
    """
    Usa FERNET_KEY do .env se disponível (produção).
    Em dev, gera chave volátil e emite aviso — tokens sobrevivem só até o restart.
    """
    if settings.FERNET_KEY:
        key = settings.FERNET_KEY
        return Fernet(key.encode() if isinstance(key, str) else key)

    import warnings
    warnings.warn(
        "FERNET_KEY não definida — tokens de integração serão inválidos após restart. "
        "Gere com: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\" "
        "e adicione FERNET_KEY=... ao seu .env",
        RuntimeWarning,
        stacklevel=2,
    )
    return Fernet(Fernet.generate_key())


_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        _fernet = _build_fernet()
    return _fernet


# ── Password utilities ───────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def validate_password_strength(password: str) -> list[str]:
    """Return a list of error messages; empty list means the password is valid."""
    errors: list[str] = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter")
    if not re.search(r"\d", password):
        errors.append("Password must contain at least one digit")
    return errors


# ── JWT helpers ──────────────────────────────────────────────────────────────

def create_access_token(subject: Any, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    jti = str(uuid.uuid4())
    payload = {
        "sub": str(subject),
        "exp": expire,
        "jti": jti,
        "type": "access",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def create_refresh_token(subject: Any, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    jti = str(uuid.uuid4())
    payload = {
        "sub": str(subject),
        "exp": expire,
        "jti": jti,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.REFRESH_TOKEN_SECRET, algorithm="HS256")


# ── Fernet helpers ───────────────────────────────────────────────────────────

def encrypt_token(token: str) -> str:
    return _get_fernet().encrypt(token.encode()).decode()


def decrypt_token(token: str) -> str:
    return _get_fernet().decrypt(token.encode()).decode()
