"""Add referrer_id and referral-related columns to user table

Revision ID: 9f8ee3aafd8f
Revises: 6ed08e82a0d2
Create Date: 2024-12-29 23:10:28.287085

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9f8ee3aafd8f'
down_revision = '6ed08e82a0d2'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('referrer_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('total_referrals', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('referral_reward', sa.Float(), nullable=True))
        batch_op.alter_column('refferral_code',
               existing_type=sa.VARCHAR(length=10),
               type_=sa.String(length=16),
               nullable=True)
        batch_op.create_foreign_key('fk_user_referrer_id', 'user', ['referrer_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.alter_column('refferral_code',
               existing_type=sa.String(length=16),
               type_=sa.VARCHAR(length=10),
               nullable=False)
        batch_op.drop_column('referral_reward')
        batch_op.drop_column('total_referrals')
        batch_op.drop_column('referrer_id')

    # ### end Alembic commands ###
