from fastapi import APIRouter
from app.api.v1.endpoints import auth, integrations, dashboard, decisions, notifications, reports, billing, ml

router = APIRouter()
router.include_router(auth.router,          prefix="/auth",          tags=["auth"])
router.include_router(integrations.router,  prefix="/integrations",  tags=["integrations"])
router.include_router(dashboard.router,     prefix="/dashboard",     tags=["dashboard"])
router.include_router(decisions.router,     prefix="/decisions",     tags=["decisions"])
router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
router.include_router(reports.router,       prefix="/reports",       tags=["reports"])
router.include_router(billing.router,       prefix="/billing",       tags=["billing"])
router.include_router(ml.router,            prefix="/ml",            tags=["ml"])
