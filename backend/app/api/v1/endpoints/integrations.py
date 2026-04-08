import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_current_org_id, get_current_user
from app.db.base import get_db
from app.models.integration import Integration, IntegrationSyncLog
from app.models.user import User
from app.services import integration as integration_service

router = APIRouter()


@router.get("/")
async def list_integrations(
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    oid = uuid.UUID(org_id)
    result = await db.execute(
        select(Integration).where(Integration.organization_id == oid)
    )
    integrations = result.scalars().all()
    return [
        {
            "id": str(i.id),
            "platform": i.platform,
            "expires_at": i.expires_at.isoformat() if i.expires_at else None,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        }
        for i in integrations
    ]


@router.get("/{integration_id}/logs")
async def get_sync_logs(
    integration_id: str,
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    oid = uuid.UUID(org_id)

    # Ownership check: ensure the integration belongs to the user's org
    integ_result = await db.execute(
        select(Integration).where(
            Integration.id == uuid.UUID(integration_id),
            Integration.organization_id == oid,
        )
    )
    if not integ_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Integração não encontrada")

    result = await db.execute(
        select(IntegrationSyncLog)
        .where(IntegrationSyncLog.integration_id == uuid.UUID(integration_id))
        .order_by(IntegrationSyncLog.last_sync_at.desc())
        .limit(limit)
    )
    logs = result.scalars().all()
    return [
        {
            "id": str(log.id),
            "status": log.status,
            "message": log.message,
            "last_sync_at": log.last_sync_at.isoformat() if log.last_sync_at else None,
        }
        for log in logs
    ]


# ── Generic connect URL ──────────────────────────────────────

@router.get("/connect/{platform}")
async def connect_url(
    platform: str,
    shop: str | None = None,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
):
    urls: dict[str, str] = {
        "mercado_livre": (
            f"https://auth.mercadolivre.com.br/authorization"
            f"?response_type=code&client_id={settings.ML_APP_ID}"
            f"&redirect_uri={settings.ML_REDIRECT_URI}&state={org_id}"
        ) if settings.ML_APP_ID else "",
        "shopify": (
            f"https://{shop}/admin/oauth/authorize"
            f"?client_id={getattr(settings, 'SHOPIFY_CLIENT_ID', '')}"
            f"&scope=read_orders,read_products"
            f"&redirect_uri={getattr(settings, 'SHOPIFY_REDIRECT_URI', '')}"
            f"&response_type=code"
        ) if shop else "",
        "stripe": (
            f"https://connect.stripe.com/oauth/authorize"
            f"?response_type=code&client_id={getattr(settings, 'STRIPE_CLIENT_ID', '')}&scope=read_write"
        ),
        "mercadopago": (
            f"https://auth.mercadopago.com.br/authorization"
            f"?client_id={getattr(settings, 'MP_CLIENT_ID', '')}"
            f"&response_type=code&platform_id=mp"
            f"&redirect_uri={getattr(settings, 'MP_REDIRECT_URI', '')}"
        ),
        "amazon": (
            f"https://sellercentral.amazon.com.br/apps/authorize/consent"
            f"?application_id={getattr(settings, 'AMAZON_LWA_CLIENT_ID', '')}&state={org_id}&version=beta"
        ),
        "nuvemshop": (
            f"https://www.tiendanube.com/apps/{getattr(settings, 'NUVEMSHOP_CLIENT_ID', '')}/authorize"
        ),
        "bling": (
            f"https://bling.com.br/Api/v3/oauth/authorize"
            f"?response_type=code&client_id={getattr(settings, 'BLING_CLIENT_ID', '')}"
            f"&state={org_id}&redirect_uri={getattr(settings, 'BLING_REDIRECT_URI', '')}"
        ),
    }
    if platform not in urls:
        raise HTTPException(404, f"Plataforma '{platform}' não suportada")
    url = urls[platform]
    if not url:
        raise HTTPException(400, f"Credenciais para '{platform}' não configuradas no .env")
    return {"platform": platform, "redirect_url": url}


@router.delete("/{integration_id}")
async def disconnect_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    oid = uuid.UUID(org_id)
    result = await db.execute(
        select(Integration).where(
            Integration.id == uuid.UUID(integration_id),
            Integration.organization_id == oid,
        )
    )
    integ = result.scalar_one_or_none()
    if not integ:
        raise HTTPException(404, "Integração não encontrada")
    await db.delete(integ)
    await db.commit()
    return {"status": "disconnected", "platform": integ.platform}


# ── Mercado Livre ────────────────────────────────────────────

@router.get("/mercadolivre/connect")
async def connect_mercadolivre(
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
):
    if not settings.ML_APP_ID:
        raise HTTPException(status_code=400, detail="ML_APP_ID não configurado no .env")
    url = (
        f"https://auth.mercadolivre.com.br/authorization"
        f"?response_type=code&client_id={settings.ML_APP_ID}"
        f"&redirect_uri={settings.ML_REDIRECT_URI}"
        f"&state={org_id}"
    )
    return {"redirect_url": url}


@router.post("/{integration_id}/sync")
async def sync_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    """Endpoint genérico de sync — detecta a plataforma automaticamente."""
    oid = uuid.UUID(org_id)
    result = await db.execute(
        select(Integration).where(
            Integration.id == uuid.UUID(integration_id),
            Integration.organization_id == oid,
        )
    )
    integ = result.scalar_one_or_none()
    if not integ:
        raise HTTPException(status_code=404, detail="Integração não encontrada")

    if integ.platform == "mercado_livre":
        return await integration_service.sync_mercadolivre(integration_id, db)
    elif integ.platform == "shopify":
        return await integration_service.sync_shopify(integration_id, db)
    else:
        return {"status": "skipped", "platform": integ.platform, "message": "Plataforma sem sync implementado"}


@router.get("/mercadolivre/callback")
async def mercadolivre_callback(
    code: str,
    state: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Callback OAuth do Mercado Livre.
    O parâmetro 'state' contém o org_id passado na URL de autorização.
    Não requer JWT porque vem diretamente do browser após redirecionamento.
    """
    if not state:
        raise HTTPException(status_code=400, detail="Parâmetro 'state' (org_id) ausente no callback")

    result = await integration_service.ml_exchange_code(code, state, db)
    if "error" in result:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/integrations?error=ml_auth_failed"
        )
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/integrations?connected=mercado_livre"
    )


@router.post("/mercadolivre/{integration_id}/sync")
async def sync_mercadolivre(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    oid = uuid.UUID(org_id)
    # Ownership check
    check = await db.execute(
        select(Integration).where(
            Integration.id == uuid.UUID(integration_id),
            Integration.organization_id == oid,
        )
    )
    if not check.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Integração não encontrada")

    return await integration_service.sync_mercadolivre(integration_id, db)


# ── Shopify ──────────────────────────────────────────────────

@router.get("/shopify/connect")
async def connect_shopify(
    shop: str,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
):
    if not settings.SHOPIFY_CLIENT_ID:
        raise HTTPException(400, "SHOPIFY_CLIENT_ID não configurado no .env")
    from app.integrations.shopify.integration import ShopifyIntegration
    url = ShopifyIntegration.get_auth_url(shop=shop, state=org_id)
    return {"redirect_url": url}


@router.get("/shopify/callback")
async def shopify_callback(
    code: str,
    shop: str,
    state: str | None = None,
    hmac: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    from app.integrations.shopify.integration import ShopifyIntegration

    try:
        token_data = await ShopifyIntegration.exchange_code(shop=shop, code=code)
        org_id = state or str(uuid.uuid4())

        # Verifica se já existe integração para este shop
        result = await db.execute(
            select(Integration).where(
                Integration.organization_id == uuid.UUID(org_id),
                Integration.platform == "shopify",
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.access_token = token_data["access_token"]
            existing.extra_data = {"shop": shop, "scope": token_data.get("scope", "")}
        else:
            db.add(Integration(
                organization_id=uuid.UUID(org_id),
                platform="shopify",
                access_token=token_data["access_token"],
                extra_data={"shop": shop, "scope": token_data.get("scope", "")},
            ))

        await db.commit()
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?connected=shopify")
    except Exception as e:
        raise HTTPException(400, f"Erro no callback Shopify: {str(e)}")


@router.post("/shopify/{integration_id}/sync")
async def sync_shopify(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    oid = uuid.UUID(org_id)
    # Ownership check
    check = await db.execute(
        select(Integration).where(
            Integration.id == uuid.UUID(integration_id),
            Integration.organization_id == oid,
        )
    )
    if not check.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Integração não encontrada")

    return await integration_service.sync_shopify(integration_id, db)


# ── Sync global ─────────────────────────────────────────────

@router.post("/sync-all")
async def sync_all(
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    oid = uuid.UUID(org_id)
    result = await db.execute(select(Integration).where(Integration.organization_id == oid))
    integrations = result.scalars().all()

    results = []
    for i in integrations:
        if i.platform == "mercado_livre":
            r = await integration_service.sync_mercadolivre(str(i.id), db)
        elif i.platform == "shopify":
            r = await integration_service.sync_shopify(str(i.id), db)
        else:
            r = {"status": "skipped"}
        results.append({"platform": i.platform, "result": r})

    return {"synced": len(results), "results": results}
