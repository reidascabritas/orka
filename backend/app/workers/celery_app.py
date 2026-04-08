from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "orka",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"],
)

celery_app.conf.timezone = "America/Sao_Paulo"

celery_app.conf.beat_schedule = {
    # Sync de integrações a cada hora
    "sync-integrations-hourly": {
        "task": "app.workers.tasks.sync_all_integrations",
        "schedule": 3600.0,
    },
    # Pipeline ML a cada 6 horas (anomalias + previsões + decisões)
    "ml-pipeline-6h": {
        "task": "app.workers.tasks.run_ml_pipeline",
        "schedule": 21600.0,
    },
    # Relatórios semanais toda segunda às 08h
    "weekly-reports-monday": {
        "task": "app.workers.tasks.generate_weekly_reports",
        "schedule": crontab(hour=8, minute=0, day_of_week=1),
    },
}
