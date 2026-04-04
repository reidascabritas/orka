from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.deps import get_current_user, get_current_org_id
from app.models.user import User
from app.services import metrics as metrics_service

router = APIRouter()


@router.get("/summary")
async def summary(
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    return await metrics_service.get_dashboard_summary(org_id, db)


@router.get("/revenue-chart")
async def revenue_chart(
    days: int = Query(default=30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    data = await metrics_service.get_revenue_chart(org_id, days, db)
    return {"days": days, "data": data}


@router.get("/top-products")
async def top_products(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    return await metrics_service.get_top_products(org_id, limit, db)


@router.get("/product/{product_id}/metrics")
async def product_metrics(
    product_id: str,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    return await metrics_service.get_metrics_by_product(org_id, product_id, db)
