from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from app.db.base import get_db
from app.core.deps import get_current_user, get_current_org_id
from app.models.user import User
from app.models.decision import Decision, DecisionLog
from app.services import decision as decision_service
import uuid

router = APIRouter()


class StatusUpdate(BaseModel):
    status: str  # pendente | aprovado | executado | ignorado


@router.get("/")
async def list_decisions(
    status: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    type: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    oid = uuid.UUID(org_id)
    query = select(Decision).where(Decision.organization_id == oid)
    if status:
        query = query.where(Decision.status == status)
    if priority:
        query = query.where(Decision.priority == priority)
    if type:
        query = query.where(Decision.type == type)
    query = query.order_by(Decision.created_at.desc()).limit(limit)
    result = await db.execute(query)
    decisions = result.scalars().all()
    return [
        {
            "id": str(d.id),
            "type": d.type,
            "priority": d.priority,
            "title": d.title,
            "description": d.description,
            "recommended_action": d.recommended_action,
            "confidence_score": float(d.confidence_score or 0),
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in decisions
    ]


@router.get("/{decision_id}")
async def get_decision(
    decision_id: str,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Decision).where(
            and_(Decision.id == uuid.UUID(decision_id), Decision.organization_id == uuid.UUID(org_id))
        )
    )
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Decisão não encontrada")

    logs_result = await db.execute(
        select(DecisionLog).where(DecisionLog.decision_id == d.id).order_by(DecisionLog.executed_at.desc())
    )
    logs = logs_result.scalars().all()

    return {
        "id": str(d.id),
        "type": d.type,
        "priority": d.priority,
        "title": d.title,
        "description": d.description,
        "recommended_action": d.recommended_action,
        "confidence_score": float(d.confidence_score or 0),
        "status": d.status,
        "created_at": d.created_at.isoformat() if d.created_at else None,
        "logs": [
            {
                "action": l.action_taken,
                "result": l.result,
                "executed_at": l.executed_at.isoformat() if l.executed_at else None,
            }
            for l in logs
        ],
    }


@router.patch("/{decision_id}/status")
async def update_status(
    decision_id: str,
    body: StatusUpdate,
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    valid = {"pendente", "aprovado", "executado", "ignorado"}
    if body.status not in valid:
        raise HTTPException(status_code=400, detail=f"Status inválido. Use: {valid}")

    result = await decision_service.update_decision_status(decision_id, body.status, db)
    if not result:
        raise HTTPException(status_code=404, detail="Decisão não encontrada")
    return result


@router.post("/generate")
async def generate_decisions(
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    created = await decision_service.generate_decisions(org_id, db)
    return {"generated": len(created), "decisions": created}
