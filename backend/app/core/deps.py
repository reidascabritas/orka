from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.security import is_token_blacklisted
from app.db.base import get_db
from app.models.user import User, UserOrganization

bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        jti: str | None = payload.get("jti")
        token_type: str | None = payload.get("type")

        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")

        # Reject refresh tokens used as access tokens
        if token_type == "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")

        # Check blacklist (logout / revocation)
        if jti and is_token_blacklisted(jti):
            raise HTTPException(status_code=401, detail="Token revogado")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user


async def get_current_org_id(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> str:
    result = await db.execute(
        select(UserOrganization).where(UserOrganization.user_id == current_user.id)
    )
    uo = result.scalar_one_or_none()
    if not uo:
        raise HTTPException(status_code=400, detail="Usuário sem organização")
    return str(uo.organization_id)
