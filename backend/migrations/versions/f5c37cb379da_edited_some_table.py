"""edited some  table

Revision ID: f5c37cb379da
Revises: 077d7953d900
Create Date: 2025-01-10 19:00:26.873459

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f5c37cb379da'
down_revision = '077d7953d900'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.create_unique_constraint('fk_user_referrer_id', ['referral_code'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_constraint('fk_user_referrer_id', type_='unique')

    # ### end Alembic commands ###
