"""Created a Account table to hold wallet address and seed

Revision ID: 1d363b06451f
Revises: b103104dd000
Create Date: 2025-01-05 03:45:23.015399

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1d363b06451f'
down_revision = 'b103104dd000'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('coin_price_history',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=True),
    sa.Column('open_price', sa.Float(), nullable=False),
    sa.Column('high_price', sa.Float(), nullable=False),
    sa.Column('low_price', sa.Float(), nullable=False),
    sa.Column('close_price', sa.Float(), nullable=False),
    sa.Column('volume', sa.Float(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('utility',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('pdes_price', sa.Float(), nullable=False),
    sa.Column('pdes_market_cap', sa.Float(), nullable=False),
    sa.Column('pdes_circulating_supply', sa.Float(), nullable=False),
    sa.Column('pdes_total_supply', sa.Float(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('account_detail',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('BTCAddress', sa.String(length=30), nullable=False),
    sa.Column('BTCAddressSeed', sa.String(length=50), nullable=False),
    sa.Column('ETHAddress', sa.String(length=30), nullable=False),
    sa.Column('ETHAddressSeed', sa.String(length=50), nullable=False),
    sa.Column('LTCAddress', sa.String(length=30), nullable=False),
    sa.Column('LTCAddressSeed', sa.String(length=50), nullable=False),
    sa.Column('USDCAddress', sa.String(length=30), nullable=False),
    sa.Column('USDCAddressSeed', sa.String(length=50), nullable=False),
    sa.Column('PDESAddres', sa.String(length=30), nullable=False),
    sa.ForeignKeyConstraint(['PDESAddres'], ['user.username'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('pdes_transaction',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('action', sa.String(length=10), nullable=False),
    sa.Column('amount', sa.Float(), nullable=False),
    sa.Column('price', sa.Float(), nullable=False),
    sa.Column('total', sa.Float(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.create_unique_constraint('fk_user_referrer_id', ['referral_code'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='unique')

    op.drop_table('pdes_transaction')
    op.drop_table('account_detail')
    op.drop_table('utility')
    op.drop_table('coin_price_history')
    # ### end Alembic commands ###
