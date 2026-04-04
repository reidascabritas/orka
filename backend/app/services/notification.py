from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update
from app.models.notification import Notification
import uuid


async def create_notification(
    org_id: str,
    user_id: str,
    type: str,
    title: str,
    message: str,
    db: AsyncSession,
) -> Notification:
    n = Notification(
        organization_id=uuid.UUID(org_id),
        user_id=uuid.UUID(user_id),
        type=type,
        title=title,
        message=message,
    )
    db.add(n)
    await db.commit()
    await db.refresh(n)
    return n


async def list_notifications(org_id: str, user_id: str, unread_only: bool, db: AsyncSession) -> list:
    oid = uuid.UUID(org_id)
    uid = uuid.UUID(user_id)
    query = select(Notification).where(
        and_(Notification.organization_id == oid, Notification.user_id == uid)
    )
    if unread_only:
        query = query.where(Notification.is_read == False)
    query = query.order_by(Notification.created_at.desc()).limit(50)
    result = await db.execute(query)
    return result.scalars().all()


async def mark_read(notification_id: str, db: AsyncSession) -> bool:
    result = await db.execute(
        select(Notification).where(Notification.id == uuid.UUID(notification_id))
    )
    n = result.scalar_one_or_none()
    if not n:
        return False
    n.is_read = True
    await db.commit()
    return True


async def mark_all_read(org_id: str, user_id: str, db: AsyncSession) -> int:
    oid = uuid.UUID(org_id)
    uid = uuid.UUID(user_id)
    result = await db.execute(
        select(Notification).where(
            and_(
                Notification.organization_id == oid,
                Notification.user_id == uid,
                Notification.is_read == False,
            )
        )
    )
    notifications = result.scalars().all()
    for n in notifications:
        n.is_read = True
    await db.commit()
    return len(notifications)
