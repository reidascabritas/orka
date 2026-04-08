"""
Métricas para o dashboard.
Usa Order (populada pelo sync de integrações) como fonte principal de receita.
Sale é usada para analytics granulares por produto quando disponível.
"""
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.metrics import Metric
from app.models.ml import Anomaly
import uuid
import sqlalchemy as sa


def _dt(d: date) -> datetime:
    """Converte date para datetime UTC para comparar com DateTime columns."""
    return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)


async def get_dashboard_summary(org_id: str, db: AsyncSession) -> dict:
    oid = uuid.UUID(org_id)

    # Receita dos últimos 30 dias (via Orders)
    since      = _dt(date.today() - timedelta(days=30))
    prev_since = _dt(date.today() - timedelta(days=60))

    rev_result = await db.execute(
        select(func.sum(Order.total_amount)).where(
            and_(Order.organization_id == oid, Order.date >= since)
        )
    )
    total_revenue = float(rev_result.scalar() or 0)

    # Receita período anterior (comparação)
    prev_rev = await db.execute(
        select(func.sum(Order.total_amount)).where(
            and_(
                Order.organization_id == oid,
                Order.date >= prev_since,
                Order.date < since,
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
            and_(Order.organization_id == oid, Order.date >= since)
        )
    )
    total_orders = int(orders_result.scalar() or 0)

    # Produtos sincronizados
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
    """Gráfico de receita diária via Orders."""
    oid = uuid.UUID(org_id)
    since = _dt(date.today() - timedelta(days=days))

    day_expr = func.cast(Order.date, sa.Date)

    result = await db.execute(
        select(
            day_expr.label("day"),
            func.sum(Order.total_amount).label("revenue"),
        )
        .where(and_(Order.organization_id == oid, Order.date >= since))
        .group_by(day_expr)
        .order_by(day_expr)
    )
    rows = result.all()
    return [{"date": str(r.day), "revenue": float(r.revenue or 0)} for r in rows]


async def get_top_products(org_id: str, limit: int, db: AsyncSession) -> list[dict]:
    """
    Top produtos por receita. Usa OrderItems se disponíveis,
    caso contrário retorna lista vazia (até o ML ser executado).
    """
    oid = uuid.UUID(org_id)
    since = _dt(date.today() - timedelta(days=30))

    # Tenta via OrderItems + Product
    result = await db.execute(
        select(
            Product.id,
            Product.name,
            func.sum(OrderItem.price * OrderItem.quantity).label("revenue"),
            func.sum(OrderItem.quantity).label("units"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(
            and_(
                Order.organization_id == oid,
                Order.date >= since,
            )
        )
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.price * OrderItem.quantity).desc())
        .limit(limit)
    )
    rows = result.all()

    if rows:
        return [
            {
                "product_id": str(r.id),
                "name": r.name,
                "revenue": float(r.revenue or 0),
                "units_sold": float(r.units or 0),
            }
            for r in rows
        ]

    # Fallback: retorna produtos com maior n° de pedidos (sem breakdown)
    result2 = await db.execute(
        select(Product.id, Product.name)
        .where(Product.organization_id == oid)
        .limit(limit)
    )
    products = result2.all()
    return [
        {
            "product_id": str(p.id),
            "name": p.name,
            "revenue": 0.0,
            "units_sold": 0.0,
        }
        for p in products
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
