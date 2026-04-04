from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.report import Report, ReportItem
from app.models.sales import Sale
from app.models.order import Order
from app.models.decision import Decision
from app.models.ml import Anomaly
from app.models.product import Product
import uuid


async def generate_report(org_id: str, report_type: str, db: AsyncSession) -> dict:
    oid = uuid.UUID(org_id)
    days = 7 if report_type == "semanal" else 30
    since = date.today() - timedelta(days=days)
    prev_since = date.today() - timedelta(days=days * 2)

    # receita
    rev = await db.execute(
        select(func.sum(Sale.revenue)).where(and_(Sale.organization_id == oid, Sale.date >= since))
    )
    total_revenue = float(rev.scalar() or 0)

    prev_rev = await db.execute(
        select(func.sum(Sale.revenue)).where(
            and_(Sale.organization_id == oid, Sale.date >= prev_since, Sale.date < since)
        )
    )
    prev_revenue = float(prev_rev.scalar() or 0)
    revenue_growth = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue else 0

    # pedidos
    orders = await db.execute(
        select(func.count(Order.id)).where(and_(Order.organization_id == oid, Order.date >= since))
    )
    total_orders = int(orders.scalar() or 0)

    # top produto
    top = await db.execute(
        select(Product.name, func.sum(Sale.revenue).label("rev"))
        .join(Sale, Sale.product_id == Product.id)
        .where(and_(Sale.organization_id == oid, Sale.date >= since))
        .group_by(Product.name)
        .order_by(func.sum(Sale.revenue).desc())
        .limit(3)
    )
    top_products = top.all()

    # anomalias
    anomalies = await db.execute(
        select(Anomaly).where(Anomaly.organization_id == oid).limit(5)
    )
    anomaly_list = anomalies.scalars().all()

    # decisões pendentes
    decisions = await db.execute(
        select(func.count(Decision.id)).where(
            and_(Decision.organization_id == oid, Decision.status == "pendente")
        )
    )
    pending_decisions = int(decisions.scalar() or 0)

    # montar relatório
    summary = (
        f"Período: últimos {days} dias. "
        f"Receita: R$ {total_revenue:,.2f} ({'+' if revenue_growth >= 0 else ''}{revenue_growth:.1f}% vs período anterior). "
        f"Pedidos: {total_orders}. "
        f"Decisões pendentes: {pending_decisions}."
    )

    problems = []
    for a in anomaly_list:
        problems.append(a.description)
    if not problems:
        problems.append("Nenhuma anomalia crítica detectada no período.")

    opportunities = []
    if top_products:
        names = ", ".join([r.name for r in top_products])
        opportunities.append(f"Produtos com maior receita: {names}.")
    if revenue_growth > 10:
        opportunities.append(f"Crescimento de receita de {revenue_growth:.1f}% — momento favorável para expansão.")
    if not opportunities:
        opportunities.append("Analise os dados de previsão para identificar oportunidades de crescimento.")

    plan = (
        f"1. Revisar as {pending_decisions} decisões pendentes no painel. "
        f"2. Verificar estoque dos produtos em alta. "
        f"3. Investigar causas das anomalias detectadas."
    )

    report = Report(
        organization_id=oid,
        type=report_type,
        summary=summary,
    )
    db.add(report)
    await db.flush()

    items = [
        ReportItem(report_id=report.id, section="resumo", content=summary),
        ReportItem(report_id=report.id, section="problemas", content="\n".join(problems)),
        ReportItem(report_id=report.id, section="oportunidades", content="\n".join(opportunities)),
        ReportItem(report_id=report.id, section="plano", content=plan),
    ]
    for item in items:
        db.add(item)

    await db.commit()

    return {
        "id": str(report.id),
        "type": report_type,
        "summary": summary,
        "sections": {
            "resumo": summary,
            "problemas": "\n".join(problems),
            "oportunidades": "\n".join(opportunities),
            "plano": plan,
        },
        "metrics": {
            "revenue": total_revenue,
            "revenue_growth_pct": round(revenue_growth, 1),
            "orders": total_orders,
            "pending_decisions": pending_decisions,
        },
    }
