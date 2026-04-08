import json
import logging
from datetime import datetime, timezone

audit_logger = logging.getLogger("orka.audit")


def log_event(
    event: str,
    user_id: str | None,
    org_id: str | None,
    ip: str | None,
    result: str,
    detail: dict | None = None,
) -> None:
    """Emit a structured JSON audit record.

    Args:
        event:   e.g. "auth.login", "auth.logout", "billing.checkout", "decision.status_update"
        user_id: UUID string of the acting user (or None for anonymous events)
        org_id:  UUID string of the organisation context
        ip:      remote IP address
        result:  "success" | "failure" | "blocked"
        detail:  optional dict with extra context (avoid PII / secrets)
    """
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": event,
        "user_id": user_id,
        "org_id": org_id,
        "ip": ip,
        "result": result,
        "detail": detail or {},
    }
    audit_logger.info(json.dumps(record, default=str))
