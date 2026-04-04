from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.deps import get_current_user, get_current_org_id
from app.models.user import User
from app.services import ml as ml_service

router = APIRouter()


@router.post("/forecast/{product_id}")
async def forecast_demand(
    product_id: str,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    return await ml_service.forecast_demand(org_id, product_id, db)


@router.post("/detect-anomalies")
async def detect_anomalies(
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    anomalies = await ml_service.detect_anomalies(org_id, db)
    return {"detected": len(anomalies), "anomalies": anomalies}
