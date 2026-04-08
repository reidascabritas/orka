import hashlib
import hmac as _hmac
import uuid
from datetime import date, datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func, and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_event
from app.core.config import settings
from app.core.deps import get_current_org_id, get_current_user
from app.db.base import get_db
from app.models.integration import Integration
from app.models.order import Order
from app.models.product import Product
from app.models.user import User

router = APIRouter()

PLANS = {
    "starter": {"name": "Starter", "price": 197, "integrations": 1,  "products": 100},
    "pro":     {"name": "Pro",     "price": 497, "integrations": 3,  "products": 1000},
    "scale":   {"name": "Scale",   "price": 997, "integrations": 10, "products": 99999},
}


# ── helpers de uso ──────────────────────────────────────────────────────────

async def _usage_counts(org_id: uuid.UUID, db: AsyncSession):
    n_int = int((await db.execute(
        select(func.count(Integration.id)).where(Integration.organization_id == org_id)
    )).scalar() or 0)
    n_prod = int((await db.execute(
        select(func.count(Product.id)).where(Product.organization_id == org_id)
    )).scalar() or 0)
    return n_int, n_prod


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ── endpoints existentes ────────────────────────────────────────────────────

@router.get("/plan")
async def get_plan(
    current_user: User = Depends(get_current_user),
    org_id: str       = Depends(get_current_org_id),
    db: AsyncSession  = Depends(get_db),
):
    oid = uuid.UUID(org_id)
    n_integrations, n_products = await _usage_counts(oid, db)

    if n_integrations <= 1 and n_products <= 100:
        current_plan = "starter"
    elif n_integrations <= 3 and n_products <= 1000:
        current_plan = "pro"
    else:
        current_plan = "scale"

    plan = PLANS[current_plan]
    return {
        "plan": current_plan,
        "name": plan["name"],
        "price_brl": plan["price"],
        "limits": {"integrations": plan["integrations"], "products": plan["products"]},
        "usage":  {"integrations": n_integrations, "products": n_products},
    }


@router.get("/usage")
async def get_usage(
    current_user: User = Depends(get_current_user),
    org_id: str       = Depends(get_current_org_id),
    db: AsyncSession  = Depends(get_db),
):
    oid   = uuid.UUID(org_id)
    since = date.today() - timedelta(days=30)

    orders_count = await db.execute(
        select(func.count(Order.id)).where(
            and_(Order.organization_id == oid, Order.date >= since)
        )
    )
    n_int, n_prod = await _usage_counts(oid, db)

    return {
        "period": "últimos 30 dias",
        "orders_processed":   int(orders_count.scalar() or 0),
        "active_integrations": n_int,
        "monitored_products":  n_prod,
    }


@router.get("/plans")
async def list_plans():
    return [{"id": k, **v} for k, v in PLANS.items()]


# ── Abacate Pay ─────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    plan: str


@router.post("/abacatepay/checkout")
async def create_abacatepay_checkout(
    body: CheckoutRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    org_id: str        = Depends(get_current_org_id),
):
    """Cria uma cobrança no Abacate Pay e retorna a URL de checkout."""
    ip = _get_client_ip(request)

    if body.plan not in PLANS:
        raise HTTPException(status_code=400, detail="Plano inválido")

    if not settings.ABACATEPAY_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Pagamentos não configurados. Configure ABACATEPAY_API_KEY no servidor.",
        )

    plan = PLANS[body.plan]
    price_cents = plan["price"] * 100  # centavos

    payload = {
        "frequency": "MONTHLY",
        "methods": ["PIX", "CREDIT_CARD", "BOLETO"],
        "products": [
            {
                "externalId": f"orka-{body.plan}",
                "name": f"Orka {plan['name']} — Assinatura Mensal",
                "description": (
                    f"Plano {plan['name']} da Orka AI — {plan['integrations']} integração(ões), "
                    f"{plan['products'] if plan['products'] != 99999 else 'ilimitados'} produtos"
                ),
                "quantity": 1,
                "price": price_cents,
            }
        ],
        "customer": {
            "name": current_user.name,
            "email": current_user.email,
            "cellphone": "",
            "taxId": "",
        },
        "returnUrl": f"{settings.FRONTEND_URL}/billing?status=success",
        "cancelUrl": f"{settings.FRONTEND_URL}/billing?status=cancelled",
        "metadata": {
            "org_id": org_id,
            "plan": body.plan,
            "user_id": str(current_user.id),
        },
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"{settings.ABACATEPAY_BASE_URL}/billing/create",
            json=payload,
            headers={
                "Authorization": f"Bearer {settings.ABACATEPAY_API_KEY}",
                "Content-Type": "application/json",
            },
        )

    if resp.status_code not in (200, 201):
        log_event(
            "billing.checkout",
            str(current_user.id),
            org_id,
            ip,
            "failure",
            {"plan": body.plan, "status_code": resp.status_code},
        )
        raise HTTPException(
            status_code=502,
            detail="Erro ao criar cobrança no Abacate Pay",
        )

    data = resp.json()
    checkout_url = data.get("url") or data.get("checkoutUrl") or data.get("data", {}).get("url")

    if not checkout_url:
        raise HTTPException(status_code=502, detail="URL de checkout não retornada pelo Abacate Pay")

    log_event(
        "billing.checkout",
        str(current_user.id),
        org_id,
        ip,
        "success",
        {"plan": body.plan},
    )
    # Return ONLY the checkout URL and billing ID — never raw payment objects / API keys
    return {"checkout_url": checkout_url, "billing_id": data.get("id")}


@router.post("/abacatepay/webhook")
async def abacatepay_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_abacatepay_signature: str = Header(None, alias="x-abacatepay-signature"),
):
    """Recebe eventos do Abacate Pay — persiste estado da assinatura no banco."""
    import json

    from app.models.user import Organization

    raw_body = await request.body()
    ip = _get_client_ip(request)

    # ── HMAC-SHA256 signature verification (always enforced when secret is set) ──
    if settings.ABACATEPAY_WEBHOOK_SECRET:
        if not x_abacatepay_signature:
            log_event("billing.webhook", None, None, ip, "blocked", {"reason": "missing_signature"})
            raise HTTPException(status_code=401, detail="Assinatura de webhook ausente")

        expected = _hmac.new(
            settings.ABACATEPAY_WEBHOOK_SECRET.encode(),
            raw_body,
            hashlib.sha256,
        ).hexdigest()

        if not _hmac.compare_digest(expected, x_abacatepay_signature):
            log_event("billing.webhook", None, None, ip, "blocked", {"reason": "invalid_signature"})
            raise HTTPException(status_code=401, detail="Assinatura de webhook inválida")

    try:
        event = json.loads(raw_body)
    except Exception:
        raise HTTPException(status_code=400, detail="Payload inválido")

    event_type = event.get("event") or event.get("type", "")
    billing    = event.get("billing") or event.get("data", {})
    metadata   = billing.get("metadata") or {}
    billing_id = billing.get("id", "")
    org_id_str = metadata.get("org_id")
    plan_id    = metadata.get("plan", "starter")

    if org_id_str:
        try:
            oid = uuid.UUID(org_id_str)
        except ValueError:
            return {"received": True, "event": event_type, "warning": "org_id inválido"}

        result = await db.execute(select(Organization).where(Organization.id == oid))
        org = result.scalar_one_or_none()

        if org:
            if event_type in ("BILLING_PAID", "billing.paid"):
                org.plan = plan_id
                org.plan_status = "active"
                org.abacatepay_billing_id = billing_id
                org.plan_expires_at = datetime.now(timezone.utc) + timedelta(days=32)

            elif event_type in ("BILLING_CANCELLED", "billing.cancelled"):
                org.plan_status = "cancelled"

            elif event_type in ("BILLING_EXPIRED", "billing.expired"):
                org.plan_status = "expired"

            await db.commit()

    log_event("billing.webhook", None, org_id_str, ip, "success", {"event_type": event_type})
    return {"received": True, "event": event_type}
