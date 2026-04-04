import asyncio
import sys
from app.workers.celery_app import celery_app


def run_async(coro):
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    return asyncio.run(coro)


@celery_app.task(name="app.workers.tasks.sync_all_integrations")
def sync_all_integrations():
    from app.db.base import AsyncSessionLocal
    from app.models.integration import Integration
    from app.services.integration import sync_mercadolivre, sync_shopify
    from sqlalchemy import select

    async def _run():
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Integration))
            integrations = result.scalars().all()
            for i in integrations:
                if i.platform == "mercado_livre":
                    await sync_mercadolivre(str(i.id), db)
                elif i.platform == "shopify":
                    await sync_shopify(str(i.id), db)

    run_async(_run())
    print("Sincronização concluída.")


@celery_app.task(name="app.workers.tasks.run_ml_pipeline")
def run_ml_pipeline():
    from app.db.base import AsyncSessionLocal
    from app.models.user import Organization
    from app.services.ml import detect_anomalies, forecast_demand
    from app.services.decision import generate_decisions
    from app.models.product import Product
    from sqlalchemy import select

    async def _run():
        async with AsyncSessionLocal() as db:
            orgs = await db.execute(select(Organization))
            for org in orgs.scalars().all():
                org_id = str(org.id)
                await detect_anomalies(org_id, db)
                products = await db.execute(
                    select(Product).where(Product.organization_id == org.id)
                )
                for p in products.scalars().all():
                    await forecast_demand(org_id, str(p.id), db)
                await generate_decisions(org_id, db)

    run_async(_run())
    print("Pipeline ML concluído.")


@celery_app.task(name="app.workers.tasks.generate_weekly_reports")
def generate_weekly_reports():
    from app.db.base import AsyncSessionLocal
    from app.models.user import Organization
    from app.services.report import generate_report
    from sqlalchemy import select

    async def _run():
        async with AsyncSessionLocal() as db:
            orgs = await db.execute(select(Organization))
            for org in orgs.scalars().all():
                await generate_report(str(org.id), "semanal", db)

    run_async(_run())
    print("Relatórios semanais gerados.")
