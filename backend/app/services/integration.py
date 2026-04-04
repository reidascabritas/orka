"""
Serviço de integração com marketplaces.
Mercado Livre, Amazon SP-API, Shopify.
"""
import httpx
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.integration import Integration, IntegrationSyncLog
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.core.security import encrypt_token, decrypt_token
from app.core.config import settings
import uuid


# ── Mercado Livre ────────────────────────────────────────────

async def ml_exchange_code(code: str, org_id: str, db: AsyncSession) -> dict:
    """Troca authorization code por access_token."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.mercadolibre.com/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": settings.ML_APP_ID,
                "client_secret": settings.ML_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.ML_REDIRECT_URI,
            },
        )
    if resp.status_code != 200:
        return {"error": resp.text}

    data = resp.json()
    oid = uuid.UUID(org_id)

    integration = Integration(
        organization_id=oid,
        platform="mercado_livre",
        access_token=encrypt_token(data["access_token"]),
        refresh_token=encrypt_token(data.get("refresh_token", "")),
        expires_at=datetime.now(timezone.utc),
    )
    db.add(integration)
    await db.commit()
    return {"message": "Mercado Livre conectado com sucesso"}


async def ml_refresh_token(integration: Integration, db: AsyncSession) -> str:
    refresh = decrypt_token(integration.refresh_token)
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.mercadolibre.com/oauth/token",
            data={
                "grant_type": "refresh_token",
                "client_id": settings.ML_APP_ID,
                "client_secret": settings.ML_CLIENT_SECRET,
                "refresh_token": refresh,
            },
        )
    data = resp.json()
    integration.access_token = encrypt_token(data["access_token"])
    integration.refresh_token = encrypt_token(data.get("refresh_token", refresh))
    await db.commit()
    return data["access_token"]


async def sync_mercadolivre(integration_id: str, db: AsyncSession) -> dict:
    result = await db.execute(select(Integration).where(Integration.id == uuid.UUID(integration_id)))
    integration = result.scalar_one_or_none()
    if not integration:
        return {"error": "Integração não encontrada"}

    token = decrypt_token(integration.access_token)
    org_id = integration.organization_id

    try:
        async with httpx.AsyncClient() as client:
            # buscar user_id do ML
            me = await client.get(
                "https://api.mercadolibre.com/users/me",
                headers={"Authorization": f"Bearer {token}"},
            )
            ml_user_id = me.json().get("id")

            # buscar pedidos recentes
            orders_resp = await client.get(
                f"https://api.mercadolibre.com/orders/search/recent?seller={ml_user_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
            orders_data = orders_resp.json().get("results", [])

        synced_orders = 0
        for o in orders_data:
            external_id = str(o.get("id"))
            exists = await db.execute(
                select(Order).where(Order.external_id == external_id)
            )
            if exists.scalar_one_or_none():
                continue

            order = Order(
                organization_id=org_id,
                external_id=external_id,
                date=datetime.fromisoformat(o.get("date_created", datetime.now(timezone.utc).isoformat())),
                total_amount=float(o.get("total_amount", 0)),
                status=o.get("status", "unknown"),
                channel="mercado_livre",
            )
            db.add(order)
            synced_orders += 1

        await db.commit()

        log = IntegrationSyncLog(
            integration_id=integration.id,
            status="success",
            message=f"{synced_orders} pedidos sincronizados.",
        )
        db.add(log)
        await db.commit()
        return {"synced_orders": synced_orders, "status": "success"}

    except Exception as e:
        log = IntegrationSyncLog(
            integration_id=integration.id,
            status="error",
            message=str(e),
        )
        db.add(log)
        await db.commit()
        return {"error": str(e), "status": "error"}


# ── Shopify ──────────────────────────────────────────────────

async def sync_shopify(integration_id: str, db: AsyncSession) -> dict:
    result = await db.execute(select(Integration).where(Integration.id == uuid.UUID(integration_id)))
    integration = result.scalar_one_or_none()
    if not integration:
        return {"error": "Integração não encontrada"}

    token = decrypt_token(integration.access_token)
    shop_domain = integration.refresh_token  # guardamos o domain aqui

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://{shop_domain}/admin/api/2024-01/orders.json?status=any&limit=50",
                headers={"X-Shopify-Access-Token": token},
            )
            orders_data = resp.json().get("orders", [])

        synced = 0
        for o in orders_data:
            external_id = str(o.get("id"))
            exists = await db.execute(select(Order).where(Order.external_id == external_id))
            if exists.scalar_one_or_none():
                continue

            order = Order(
                organization_id=integration.organization_id,
                external_id=external_id,
                date=datetime.fromisoformat(o.get("created_at", "")),
                total_amount=float(o.get("total_price", 0)),
                status=o.get("financial_status", "unknown"),
                channel="shopify",
            )
            db.add(order)
            synced += 1

        await db.commit()
        log = IntegrationSyncLog(integration_id=integration.id, status="success", message=f"{synced} pedidos.")
        db.add(log)
        await db.commit()
        return {"synced_orders": synced, "status": "success"}

    except Exception as e:
        log = IntegrationSyncLog(integration_id=integration.id, status="error", message=str(e))
        db.add(log)
        await db.commit()
        return {"error": str(e)}
