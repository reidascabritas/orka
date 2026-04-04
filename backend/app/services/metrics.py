from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.sales import Sale
from app.models.order import Order
from app.models.product import Product
from app.models.metrics import Metric
from app.models.ml import Anomaly
import uuid


async def get_dashboard_summary(org_id: str, db: AsyncSession) -> dict:
    oid = uuid.UUID(org_id)

    # Receita total (últimos 30 dias)
    since = date.today() - timedelta(days=30)
    rev_result = await db.execute(
        select(func.sum(Sale.revenue)).where(
            and_(Sale.organization_id == oid, Sale.date >= since)
        )
    )
    total_revenue = float(rev_result.scalar() or 0)

    # Receita mês anterior (comparação)
    prev_since = date.today() - timedelta(days=60)
    prev_rev = await db.execute(
        select(func.sum(Sale.revenue)).where(
            and_(
                Sale.organization_id == oid,
                Sale.date >= prev_since,
                Sale.date < since,
            )
        )
    )
    prev_revenue = float(prev_rev.scalar() or 0)
    revenue_growth = (
        ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue else 0
    )

    # Total de pedidos (últimos 30 dias)
    orders_result = await db.execute(
        select(func.count(Order.id)).where(
            and_(
                Order.organization_id == oid,
                Order.date >= since,
            )
        )
    )
    total_orders = int(orders_result.scalar() or 0)

    # Produtos ativos
    products_result = await db.execute(
        select(func.count(Product.id)).where(Product.organization_id == oid)
    )
    total_products = int(products_result.scalar() or 0)

    # Anomalias ativas
    anomalies_result = await db.execute(
        select(func.count(Anomaly.id)).where(Anomaly.organization_id == oid)
    )
    total_anomalies = int(anomalies_result.scalar() or 0)

    return {
        "revenue_30d": round(total_revenue, 2),
        "revenue_growth_pct": round(revenue_growth, 1),
        "orders_30d": total_orders,
        "total_products": total_products,
        "active_anomalies": total_anomalies,
    }


async def get_revenue_chart(org_id: str, days: int, db: AsyncSession) -> list[dict]:
    oid = uuid.UUID(org_id)
    since = date.today() - timedelta(days=days)

    result = await db.execute(
        select(Sale.date, func.sum(Sale.revenue).label("revenue"))
        .where(and_(Sale.organization_id == oid, Sale.date >= since))
        .group_by(Sale.date)
        .order_by(Sale.date)
    )
    rows = result.all()
    return [{"date": str(r.date), "revenue": float(r.revenue or 0)} for r in rows]


async def get_top_products(org_id: str, limit: int, db: AsyncSession) -> list[dict]:
    oid = uuid.UUID(org_id)
    since = date.today() - timedelta(days=30)

    result = await db.execute(
        select(
            Product.id,
            Product.name,
            func.sum(Sale.revenue).label("revenue"),
            func.sum(Sale.units_sold).label("units"),
        )
        .join(Sale, Sale.product_id == Product.id)
        .where(and_(Sale.organization_id == oid, Sale.date >= since))
        .group_by(Product.id, Product.name)
        .order_by(func.sum(Sale.revenue).desc())
        .limit(limit)
    )
    rows = result.all()
    return [
        {
            "product_id": str(r.id),
            "name": r.name,
            "revenue": float(r.revenue or 0),
            "units_sold": float(r.units or 0),
        }
        for r in rows
    ]


async def get_metrics_by_product(org_id: str, product_id: str, db: AsyncSession) -> list[dict]:
    oid = uuid.UUID(org_id)
    pid = uuid.UUID(product_id)

    result = await db.execute(
        select(Metric)
        .where(and_(Metric.organization_id == oid, Metric.product_id == pid))
        .order_by(Metric.date.desc())
        .limit(90)
    )
    metrics = result.scalars().all()
    return [
        {
            "date": str(m.date),
            "revenue": float(m.revenue or 0),
            "cost": float(m.cost or 0),
            "margin": float(m.margin or 0),
            "growth_rate": float(m.growth_rate or 0),
            "trend_score": float(m.trend_score or 0),
        }
        for m in metrics
    ]
