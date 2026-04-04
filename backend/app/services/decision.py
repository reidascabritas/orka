"""
Motor de decisões: analisa dados e gera recomendações acionáveis.
"""
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.decision import Decision
from app.models.sales import Sale
from app.models.product import Product
from app.models.ml import Anomaly, Prediction
from app.models.metrics import Metric
import uuid


async def generate_decisions(org_id: str, db: AsyncSession) -> list[dict]:
    oid = uuid.UUID(org_id)
    decisions_created = []

    products_result = await db.execute(
        select(Product).where(Product.organization_id == oid)
    )
    products = products_result.scalars().all()

    for product in products:
        since = date.today() - timedelta(days=30)

        # métricas recentes
        metric = await db.execute(
            select(Metric)
            .where(and_(Metric.organization_id == oid, Metric.product_id == product.id))
            .order_by(Metric.date.desc())
            .limit(1)
        )
        m = metric.scalar_one_or_none()

        # anomalias do produto
        anomaly = await db.execute(
            select(Anomaly)
            .where(and_(Anomaly.organization_id == oid, Anomaly.product_id == product.id))
            .order_by(Anomaly.detected_at.desc())
            .limit(1)
        )
        a = anomaly.scalar_one_or_none()

        # previsão
        pred = await db.execute(
            select(func.sum(Prediction.predicted_demand))
            .where(and_(Prediction.organization_id == oid, Prediction.product_id == product.id))
        )
        forecast_total = float(pred.scalar() or 0)

        # vendas recentes
        sales_result = await db.execute(
            select(func.sum(Sale.units_sold))
            .where(and_(Sale.organization_id == oid, Sale.product_id == product.id, Sale.date >= since))
        )
        recent_units = float(sales_result.scalar() or 0)

        # Decisão: reabastecimento se previsão >> vendas recentes
        if forecast_total > recent_units * 1.3 and forecast_total > 0:
            qty = round(forecast_total - recent_units)
            d = Decision(
                organization_id=oid,
                type="reabastecimento",
                priority="alta" if qty > recent_units else "media",
                title=f"Repor estoque — {product.name}",
                description=f"Previsão de demanda ({forecast_total:.0f} un) supera estoque/vendas recentes ({recent_units:.0f} un).",
                recommended_action=f"Comprar {qty} unidades de '{product.name}' para os próximos 30 dias.",
                confidence_score=0.78,
            )
            db.add(d)
            decisions_created.append({"type": "reabastecimento", "product": product.name})

        # Decisão: queda de vendas → investigar preço
        if a and a.type == "queda" and a.severity in ("medium", "high"):
            d = Decision(
                organization_id=oid,
                type="price_adjust",
                priority="alta" if a.severity == "high" else "media",
                title=f"Revisão de preço — {product.name}",
                description=f"Queda significativa nas vendas detectada. {a.description}",
                recommended_action=f"Avaliar redução de preço ou promoção para '{product.name}' para recuperar volume.",
                confidence_score=0.72,
            )
            db.add(d)
            decisions_created.append({"type": "price_adjust", "product": product.name})

        # Decisão: spike de vendas → oportunidade de promoção
        if a and a.type == "spike":
            d = Decision(
                organization_id=oid,
                type="promocao",
                priority="media",
                title=f"Oportunidade de promoção — {product.name}",
                description=f"Alta demanda detectada. {a.description}",
                recommended_action=f"Considerar campanha de marketing para capitalizar o momento de '{product.name}'.",
                confidence_score=0.65,
            )
            db.add(d)
            decisions_created.append({"type": "promocao", "product": product.name})

        # Decisão: margem baixa
        if m and m.margin and float(m.margin) < 0.1:
            d = Decision(
                organization_id=oid,
                type="price_adjust",
                priority="alta",
                title=f"Margem crítica — {product.name}",
                description=f"Margem de {float(m.margin)*100:.1f}% está abaixo do mínimo saudável (10%).",
                recommended_action=f"Renegociar custo de fornecimento ou ajustar preço de venda de '{product.name}'.",
                confidence_score=0.90,
            )
            db.add(d)
            decisions_created.append({"type": "margem", "product": product.name})

    await db.commit()
    return decisions_created


async def update_decision_status(decision_id: str, status: str, db: AsyncSession) -> dict:
    from app.models.decision import DecisionLog
    result = await db.execute(select(Decision).where(Decision.id == uuid.UUID(decision_id)))
    decision = result.scalar_one_or_none()
    if not decision:
        return None

    decision.status = status

    log = DecisionLog(
        decision_id=decision.id,
        action_taken=f"Status alterado para '{status}'",
        result="Atualizado via API",
    )
    db.add(log)
    await db.commit()
    return {"id": decision_id, "status": status}
