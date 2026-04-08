"""add plan and subscription fields to organizations

Revision ID: a3f7c9d2e841
Revises: 9952dbebbe27
Create Date: 2026-04-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a3f7c9d2e841'
down_revision: Union[str, Sequence[str], None] = '9952dbebbe27'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Campos de assinatura na organização
    op.add_column('organizations',
        sa.Column('plan', sa.String(), nullable=True, server_default='starter'))
    op.add_column('organizations',
        sa.Column('plan_status', sa.String(), nullable=True, server_default='trial'))
    op.add_column('organizations',
        sa.Column('abacatepay_billing_id', sa.String(), nullable=True))
    op.add_column('organizations',
        sa.Column('plan_expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('organizations', 'plan_expires_at')
    op.drop_column('organizations', 'abacatepay_billing_id')
    op.drop_column('organizations', 'plan_status')
    op.drop_column('organizations', 'plan')
