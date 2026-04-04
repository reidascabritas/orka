"""
Serviço de ML: previsão de demanda e detecção de anomalias.
Usa scikit-learn com dados históricos de vendas.
"""
from datetime import date, timedelta, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.sales import Sale
from app.models.product import Product
from app.models.ml import Prediction, Anomaly
import uuid
import numpy as np


async def forecast_demand(org_id: str, product_id: str, db: AsyncSession) -> dict:
    """Previsão de demanda para os próximos 30 dias usando regressão linear."""
    from sklearn.linear_model import LinearRegression

    oid = uuid.UUID(org_id)
    pid = uuid.UUID(product_id)
    since = date.today() - timedelta(days=90)

    result = await db.execute(
        select(Sale.date, Sale.units_sold)
        .where(and_(Sale.organization_id == oid, Sale.product_id == pid, Sale.date >= since))
        .order_by(Sale.date)
    )
    rows = result.all()

    if len(rows) < 7:
        return {"product_id": product_id, "forecast": [], "confidence": 0.0, "message": "Dados insuficientes"}

    X = np.array(range(len(rows))).reshape(-1, 1)
    y = np.array([float(r.units_sold or 0) for r in rows])

    model = LinearRegression()
    model.fit(X, y)
    score = float(max(0, model.score(X, y)))

    future_X = np.array(range(len(rows), len(rows) + 30)).reshape(-1, 1)
    future_y = model.predict(future_X)

    forecast = []
    for i, val in enumerate(future_y):
        forecast_date = date.today() + timedelta(days=i + 1)
        predicted = max(0, float(val))
        forecast.append({"date": str(forecast_date), "units": round(predicted, 1)})

        # salvar no banco
        db.add(Prediction(
            organization_id=oid,
            product_id=pid,
            predicted_demand=predicted,
            prediction_date=datetime.combine(forecast_date, datetime.min.time()).replace(tzinfo=timezone.utc),
            confidence_score=score,
            model_version="linear_v1",
        ))

    await db.commit()
    return {"product_id": product_id, "forecast": forecast, "confidence": round(score, 3)}


async def detect_anomalies(org_id: str, db: AsyncSession) -> list[dict]:
    """Detecta produtos com comportamento anômalo nos últimos 30 dias."""
    oid = uuid.UUID(org_id)
    since = date.today() - timedelta(days=30)
    prev_since = date.today() - timedelta(days=60)

    products_result = await db.execute(
        select(Product).where(Product.organization_id == oid)
    )
    products = products_result.scalars().all()
    anomalies_found = []

    for product in products:
        # vendas recentes
        recent = await db.execute(
            select(Sale.units_sold).where(
                and_(Sale.product_id == product.id, Sale.date >= since)
            )
        )
        recent_vals = [float(r.units_sold or 0) for r in recent.all()]

        # vendas anteriores
        prev = await db.execute(
            select(Sale.units_sold).where(
                and_(
                    Sale.product_id == product.id,
                    Sale.date >= prev_since,
                    Sale.date < since,
                )
            )
        )
        prev_vals = [float(r.units_sold or 0) for r in prev.all()]

        if not recent_vals or not prev_vals:
            continue

        recent_avg = np.mean(recent_vals)
        prev_avg = np.mean(prev_vals)

        if prev_avg == 0:
            continue

        change_pct = (recent_avg - prev_avg) / prev_avg * 100

        anomaly_type = None
        severity = None

        if change_pct <= -40:
            anomaly_type = "queda"
            severity = "high" if change_pct <= -60 else "medium"
        elif change_pct >= 80:
            anomaly_type = "spike"
            severity = "high" if change_pct >= 150 else "medium"

        if anomaly_type:
            desc = (
                f"Produto '{product.name}' com {anomaly_type} de {abs(change_pct):.0f}% "
                f"nas vendas em relação ao período anterior."
            )
            anomaly = Anomaly(
                organization_id=oid,
                product_id=product.id,
                type=anomaly_type,
                severity=severity,
                description=desc,
            )
            db.add(anomaly)
            anomalies_found.append({
                "product_id": str(product.id),
                "product_name": product.name,
                "type": anomaly_type,
                "severity": severity,
                "change_pct": round(change_pct, 1),
                "description": desc,
            })

    await db.commit()
    return anomalies_found
