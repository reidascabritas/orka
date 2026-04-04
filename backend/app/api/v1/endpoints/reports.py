from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from app.db.base import get_db
from app.core.deps import get_current_user, get_current_org_id
from app.models.user import User
from app.models.report import Report, ReportItem
from app.services import report as report_service
import uuid

router = APIRouter()


class GenerateReportRequest(BaseModel):
    type: str = "mensal"  # mensal | semanal


@router.get("/")
async def list_reports(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    oid = uuid.UUID(org_id)
    result = await db.execute(
        select(Report)
        .where(Report.organization_id == oid)
        .order_by(Report.generated_at.desc())
        .limit(limit)
    )
    reports = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "type": r.type,
            "summary": r.summary,
            "generated_at": r.generated_at.isoformat() if r.generated_at else None,
        }
        for r in reports
    ]


@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report).where(
            and_(Report.id == uuid.UUID(report_id), Report.organization_id == uuid.UUID(org_id))
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")

    items_result = await db.execute(
        select(ReportItem).where(ReportItem.report_id == report.id)
    )
    items = items_result.scalars().all()

    return {
        "id": str(report.id),
        "type": report.type,
        "summary": report.summary,
        "generated_at": report.generated_at.isoformat() if report.generated_at else None,
        "sections": {item.section: item.content for item in items},
    }


@router.post("/generate")
async def generate_report(
    body: GenerateReportRequest,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    if body.type not in ("mensal", "semanal"):
        raise HTTPException(status_code=400, detail="Tipo deve ser 'mensal' ou 'semanal'")
    return await report_service.generate_report(org_id, body.type, db)
