from sqlalchemy import Column, String, ForeignKey, DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from app.db.base import Base

class Integration(Base):
    __tablename__ = "integrations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    platform = Column(String, nullable=False)  # mercado_livre, amazon, shopify...
    access_token = Column(Text)   # criptografado
    refresh_token = Column(Text)  # criptografado
    expires_at = Column(DateTime(timezone=True))
    extra_data = Column(JSONB, nullable=True)  # shop domain, scopes, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class IntegrationSyncLog(Base):
    __tablename__ = "integration_sync_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    integration_id = Column(UUID(as_uuid=True), ForeignKey("integrations.id"), nullable=False, index=True)
    status = Column(String)  # success, error
    message = Column(Text)
    last_sync_at = Column(DateTime(timezone=True), server_default=func.now())
