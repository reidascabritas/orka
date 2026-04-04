from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.deps import get_current_user, get_current_org_id
from app.models.user import User
from app.services import notification as notif_service

router = APIRouter()


@router.get("/")
async def list_notifications(
    unread_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    notifications = await notif_service.list_notifications(org_id, str(current_user.id), unread_only, db)
    return [
        {
            "id": str(n.id),
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifications
    ]


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ok = await notif_service.mark_read(notification_id, db)
    if not ok:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    return {"id": notification_id, "is_read": True}


@router.post("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db),
):
    count = await notif_service.mark_all_read(org_id, str(current_user.id), db)
    return {"marked_read": count}
