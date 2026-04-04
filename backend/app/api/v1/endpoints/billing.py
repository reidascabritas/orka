from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, timedelta
from app.db.base import get_db
from app.core.deps import get_current_user, get_current_org_id
from app.models.user import User
from app.models.integration import Integration
from app.models.order import Order
from app.models.product import Product
import uuid

router = APIRouter()

PLANS = {
    "starter": {"name": "Starter", "price": 197, "integrations": 1, "products": 100},
    "pro":     {"name": "Pro",     "price": 497, "integrations": 3, "products": 1000},
    "scale":   {"name": "Scale",   "price": 997, "integrations": 10, "products": 99999},
}


@router.get("/plan")
async def get_plan(
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    oid = uuid.UUID(org_id)

    integrations_count = await db.execute(
        select(func.count(Integration.id)).where(Integration.organization_id == oid)
    )
    products_count = await db.execute(
        select(func.count(Product.id)).where(Product.organization_id == oid)
    )

    n_integrations = int(integrations_count.scalar() or 0)
    n_products = int(products_count.scalar() or 0)

    # determinar plano atual (simplificado)
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
        "limits": {
            "integrations": plan["integrations"],
            "products": plan["products"],
        },
        "usage": {
            "integrations": n_integrations,
            "products": n_products,
        },
    }


@router.get("/usage")
async def get_usage(
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    oid = uuid.UUID(org_id)
    since = date.today() - timedelta(days=30)

    orders_count = await db.execute(
        select(func.count(Order.id)).where(
            and_(Order.organization_id == oid, Order.date >= since)
        )
    )
    integrations_count = await db.execute(
        select(func.count(Integration.id)).where(Integration.organization_id == oid)
    )
    products_count = await db.execute(
        select(func.count(Product.id)).where(Product.organization_id == oid)
    )

    return {
        "period": "últimos 30 dias",
        "orders_processed": int(orders_count.scalar() or 0),
        "active_integrations": int(integrations_count.scalar() or 0),
        "monitored_products": int(products_count.scalar() or 0),
    }


@router.get("/plans")
async def list_plans():
    return [
        {"id": k, **v}
        for k, v in PLANS.items()
    ]
