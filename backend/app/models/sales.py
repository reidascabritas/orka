from sqlalchemy import Column, ForeignKey, Numeric, Date
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.base import Base

class Sale(Base):
    __tablename__ = "sales"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    units_sold = Column(Numeric(10, 2))
    revenue = Column(Numeric(12, 2))
