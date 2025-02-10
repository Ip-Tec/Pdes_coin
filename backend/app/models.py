from app import db
from datetime import datetime
from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from sqlalchemy.types import Enum as SqEnum
from app.enumValue import TicketPriority, TicketStatus


# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    refresh_key = db.Column(db.String(128))

    role = db.Column(db.String(20), nullable=False, default="user")
    last_reward_date = db.Column(db.DateTime, nullable=True)
    sticks = db.Column(db.Integer, default=0)  # To track infractions
    is_blocked = db.Column(
        db.Boolean, default=False
    )  # # To mark if the user is blocked
    correct_balance = db.Column(
        db.Float, default=0.0
    )  # Correct balance for reconciliation

    transactions = db.relationship("Transaction", backref="user", lazy=True)
    cryptos = db.relationship("Crypto", backref="user", lazy=True)
    balance = db.relationship("Balance", uselist=False, backref="user", lazy=True)
    tickets = db.relationship(
        "SupportTicket", back_populates="user", cascade="all, delete-orphan"
    )
    responses = db.relationship(
        "SupportResponse", back_populates="user", cascade="all, delete-orphan"
    )

    referral_code = db.Column(db.String(16), unique=True, nullable=True)
    referrer_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    referrals = db.relationship(
        "User", backref=db.backref("referrer", remote_side=[id]), lazy=True
    )

    total_referrals = db.Column(db.Integer, default=0)
    referral_reward = db.Column(db.Float, default=0.0)

    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    # Relationships
    transactions = db.relationship(
        "Transaction",
        foreign_keys="Transaction.user_id",  # Specify the foreign key for user transactions
        back_populates="user",
    )
    confirmed_transactions = db.relationship(
        "Transaction",
        foreign_keys="Transaction.confirm_by",  # Specify the foreign key for admin confirmations
        back_populates="admin",
    )

    # Return a serialize info
    def serialize(self):
        # If no balance is found, default to 0.0
        balance = self.balance.balance if self.balance else 0.0

        # Calculate total crypto_balance (sum of all crypto balances)
        total_crypto_balance = (
            sum(crypto.amount for crypto in self.cryptos) if self.cryptos else 0.0
        )

        return {
            "id": self.id,
            "role": self.role,
            "balance": balance,
            "email": self.email,
            "sticks": self.sticks,
            "full_name": self.name,
            "username": self.username,
            "is_blocked": self.is_blocked,
            "crypto_balance": total_crypto_balance,
            "referral_code": self.referral_code,
            "total_referrals": self.total_referrals,
            "referral_reward": self.referral_reward,
            "created_at": self.created_at.isoformat() if self.created_at else "",
        }

    # Return a serialize info for admin
    def serialize_admin(self):
        # If no balance is found, default to 0.0
        balance = self.balance.balance if self.balance else 0.0

        # Calculate total crypto_balance (sum of all crypto balances)
        total_crypto_balance = (
            sum(crypto.amount for crypto in self.cryptos) if self.cryptos else 0.0
        )

        return {
            "id": self.id,
            "role": self.role,
            "balance": balance,
            "email": self.email,
            "sticks": self.sticks,
            "full_name": self.name,
            "username": self.username,
            "is_blocked": self.is_blocked,
            "referrer_id": self.referrer_id,
            "referral_code": self.referral_code,
            "crypto_balance": total_crypto_balance,
            "total_referrals": self.total_referrals,
            "referral_reward": self.referral_reward,
            "last_reward_date": self.last_reward_date,
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "updated_at": self.updated_at.isoformat() if self.created_at else "",
        }


# Balance model
class Balance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    balance = db.Column(db.Float, nullable=False, default=0.0)
    crypto_balance = db.Column(db.Float, nullable=False, default=0.0)
    rewards = db.Column(db.Float, nullable=False, default=0.0)  # New column for rewards
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "balance": self.balance,
            "rewards": self.rewards,
            "crypto_balance": self.crypto_balance,
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "updated_at": self.updated_at.isoformat() if self.updated_at else "",
        }

    def update_balance_field(self, field, amount):
        if field == "balance":
            self.balance += amount
        elif field == "crypto_balance":
            self.crypto_balance += amount
        elif field == "rewards":
            self.rewards += amount
        db.session.commit()
        return self.serialize()


# Deposit model to track deposits
class Deposit(db.Model):

    __tablename__ = "Deposit"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey("DepositAccount.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)  # Amount deposited
    currency = db.Column(
        db.String(10), nullable=False, default="naira"
    )  # 'naira' or 'crypto'
    transaction_id = db.Column(
        db.String(100), unique=True, nullable=False
    )  # Unique transaction ID
    session_id = db.Column(
        db.String(100), unique=True, nullable=True
    )  # Optional session ID
    deposit_method = db.Column(
        db.String(50), nullable=False
    )  # Method (e.g., 'bank transfer', 'wallet')
    status = db.Column(
        db.String(20), nullable=False, default="pending"
    )  # 'pending', 'completed', 'failed'
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "currency": self.currency,
            "transaction_id": self.transaction_id,
            "session_id": self.session_id,
            "deposit_method": self.deposit_method,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "updated_at": self.updated_at.isoformat() if self.updated_at else "",
        }

    # Return serialized info for admin
    def serialize_admin(self):
        user = User.query.get(self.admin_id)
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "currency": self.currency,
            "transaction_id": self.transaction_id,
            "session_id": self.session_id,
            "deposit_method": self.deposit_method,
            "status": self.status,
            "user": user.serialize() if user else None,
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "updated_at": self.updated_at.isoformat() if self.updated_at else "",
        }

    # Return serialized info with the user
    def serialize_with_user(self):
        user = User.query.get(self.user_id)
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "currency": self.currency,
            "transaction_id": self.transaction_id,
            "session_id": self.session_id,
            "deposit_method": self.deposit_method,
            "status": self.status,
            "user": user.serialize() if user else None,
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "updated_at": self.updated_at.isoformat() if self.updated_at else "",
        }


# Transaction model
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=False
    )  # Normal user
    confirm_by = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=True
    )  # Admin user

    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=True)
    account_name = db.Column(db.String(100), nullable=False)
    account_number = db.Column(db.String(30), nullable=True)
    crypto_address = db.Column(db.String(50), nullable=True)
    transaction_type = db.Column(db.String(20), nullable=False)
    transaction_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    # Relationships
    user = db.relationship(
        "User",
        foreign_keys=[user_id],  # Specify the foreign key for user
        back_populates="transactions",
    )
    admin = db.relationship(
        "User",
        foreign_keys=[confirm_by],  # Specify the foreign key for admin
        back_populates="confirmed_transactions",
    )

    # Return a serialized info
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "currency": self.currency,
            "account_name": self.account_name,
            "account_number": self.account_number,
            "crypto_address": self.crypto_address,
            "transaction_type": self.transaction_type,
            "transaction_completed": self.transaction_completed,
            "confirm_by": self.confirm_by,
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "updated_at": self.updated_at.isoformat() if self.updated_at else "",
        }

    # Return the info of the user who confirmed the transaction
    def serialize_confirm_by(self):
        if self.confirm_by:
            user = User.query.get(self.confirm_by)
            return {
                "id": self.id,
                "amount": self.amount,
                "currency": self.currency,
                "user_id": self.user_id,
                "confirm_by": self.confirm_by,
                "crypto_address": self.crypto_address,
                "account_name": self.account_name,
                "account_number": self.account_number,
                "transaction_type": self.transaction_type,
                "user": user.serialize() if user else None,
                "transaction_completed": self.transaction_completed,
                "created_at": self.created_at.isoformat() if self.created_at else "",
                "updated_at": self.updated_at.isoformat() if self.updated_at else "",
            }


# Crypto model
class Crypto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    crypto_name = db.Column(db.String(100), nullable=False)
    account_address = db.Column(db.String(100), unique=True, nullable=False)

    # Rerun the balance of the crypto
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "crypto_name": self.crypto_name,
            "account_address": self.account_address,
        }


# Current percentage for rewards
class RewardConfig(db.Model):
    __tablename__ = "reward_config"

    id = db.Column(db.Integer, primary_key=True)
    percentage_weekly = db.Column(
        db.Float, nullable=False, default=0.0
    )  # Weekly percentage
    updated_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    def serialize(self):
        return {
            "id": self.id,
            "percentage_weekly": self.percentage_weekly,
            "updated_at": self.updated_at.isoformat(),
        }


# Reward percentage rate and its duration
class RewardSetting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    weekly_percentage = db.Column(
        db.Float, nullable=False, default=20.0
    )  # Weekly reward in %
    start_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    end_date = db.Column(db.DateTime, nullable=True)  # Optional end date

    def daily_rate(self):
        return self.weekly_percentage / 7  # Convert weekly rate to daily


# PdesTransaction model for handling buy/sell of Pdes coin
class PdesTransaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    action = db.Column(db.String(10), nullable=False)  # 'buy' or 'sell'
    amount = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    reward_earned = db.Column(
        db.Float, default=0.0
    )  # Store reward earned from transaction

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "amount": self.amount,
            "price": self.price,
            "total": self.total,
            "reward_earned": self.reward_earned,
            "created_at": self.created_at.isoformat(),
        }


# CoinPriceHistory model for storing price history (for charts)
class CoinPriceHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    open_price = db.Column(db.Float, nullable=False)
    high_price = db.Column(db.Float, nullable=False)
    low_price = db.Column(db.Float, nullable=False)
    close_price = db.Column(db.Float, nullable=False)
    volume = db.Column(db.Float, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "open_price": self.open_price,
            "high_price": self.high_price,
            "low_price": self.low_price,
            "close_price": self.close_price,
            "volume": self.volume,
        }

    def record_price(self, open_price, close_price, volume):
        self.open_price = open_price
        self.close_price = close_price
        self.high_price = max(open_price, close_price)
        self.low_price = min(open_price, close_price)
        self.volume = volume
        db.session.add(self)
        db.session.commit()


class Utility(db.Model):
    __tablename__ = "utility"

    id = db.Column(db.Integer, primary_key=True)
    pdes_buy_price = db.Column(db.Float, nullable=False)
    pdes_sell_price = db.Column(db.Float, nullable=False)
    pdes_market_cap = db.Column(db.Float, nullable=False)
    pdes_circulating_supply = db.Column(db.Float, nullable=False)
    conversion_rate = db.Column(db.Float, nullable=False, default=1980)
    reward_percentage = db.Column(db.Float, nullable=False, default=25.0)  # Default 25%
    referral_percentage = db.Column(db.Float, nullable=False, default=5.0)  # Default 5%
    pdes_supply_left = db.Column(db.Float, nullable=False, default=8000000000.0)
    pdes_total_supply = db.Column(db.Float, nullable=False, default=8000000000.0)

    def serialize(self):
        return {
            "id": self.id,
            "pdes_buy_price": self.pdes_buy_price,
            "pdes_sell_price": self.pdes_sell_price,
            "conversion_rate": self.conversion_rate,
            "pdes_market_cap": self.pdes_market_cap,
            "pdes_supply_left": self.pdes_supply_left,
            "pdes_total_supply": self.pdes_total_supply,
            "reward_percentage": self.reward_percentage,
            "referral_percentage": self.referral_percentage,
            "pdes_circulating_supply": self.pdes_circulating_supply,
        }

    def update_price(self, price_change_factor: float):
        self.pdes_buy_price *= price_change_factor
        self.pdes_sell_price *= price_change_factor
        db.session.commit()


# To hold the user's crypto addresses
class AccountDetail(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    BTCAddress = db.Column(db.String(30), nullable=False)
    BTCAddressSeed = db.Column(db.String(50), nullable=False)
    ETHAddress = db.Column(db.String(30), nullable=False)
    ETHAddressSeed = db.Column(db.String(50), nullable=False)
    LTCAddress = db.Column(db.String(30), nullable=False)
    LTCAddressSeed = db.Column(db.String(50), nullable=False)
    USDCAddress = db.Column(db.String(30), nullable=False)
    USDCAddressSeed = db.Column(db.String(50), nullable=False)
    PDESAddress = db.Column(
        db.String(30), db.ForeignKey("user.username"), nullable=False
    )

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "BTC": self.BTCAddress,
            "ETH": self.ETHAddress,
            "LTC": self.LTCAddress,
            "USDC": self.USDCAddress,
        }

    # unserialize function
    def unserialize(self, data):
        self.user_id = data["user_id"]
        self.BTCAddress = data["BTCAddress"]
        self.BTCAddressSeed = data["BTCAddressSeed"]
        self.ETHAddress = data["ETHAddress"]
        self.ETHAddressSeed = data["ETHAddressSeed"]
        self.LTCAddress = data["LTCAddress"]
        self.LTCAddressSeed = data["LTCAddressSeed"]
        self.USDCAddress = data["USDCAddress"]
        self.USDCAddressSeed = data["USDCAddressSeed"]
        self.PDESAddress = data["PDESAddress"]


# Notification model
class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    message = db.Column(db.String(200), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat(),
        }


# List of account user's can deposit in
class DepositAccount(db.Model):
    __tablename__ = "DepositAccount"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    bank_name = db.Column(db.String(50), nullable=False)
    account_name = db.Column(db.String(50), nullable=False)
    account_number = db.Column(db.String(50), nullable=False)
    account_type = db.Column(db.String(50), nullable=True, default="savings")
    max_deposit_amount = db.Column(db.Float, nullable=False, default=98999.00)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "bank_name": self.bank_name,
            "account_name": self.account_name,
            "account_number": self.account_number,
            "account_type": self.account_type,
            "max_deposit_amount": self.max_deposit_amount,
        }

    # Get Maxsimum Deposit Amount
    def get_max_deposit_amount(self):
        return self.max_deposit_amount


class SupportTicket(db.Model):
    __tablename__ = "support_tickets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)

    # Use SQLAlchemy Enum type for status and priority
    status = db.Column(
        SqEnum(TicketStatus), default=TicketStatus.OPEN.value, nullable=False
    )
    priority = db.Column(
        SqEnum(TicketPriority), default=TicketPriority.MEDIUM.value, nullable=False
    )

    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, onupdate=db.func.current_timestamp())

    user = db.relationship("User", back_populates="tickets")
    responses = db.relationship(
        "SupportResponse", back_populates="ticket", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<SupportTicket id={self.id} title={self.title} status={self.status}>"


class SupportResponse(db.Model):
    __tablename__ = "support_responses"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(
        db.Integer, db.ForeignKey("support_tickets.id"), nullable=False
    )
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=True
    )  # Nullable for system-generated responses
    sender_role = db.Column(db.String(20), nullable=False)  # "user" or "admin"
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    ticket = db.relationship("SupportTicket", back_populates="responses")
    user = db.relationship("User", back_populates="responses")

    def __repr__(self):
        return f"<SupportResponse id={self.id} ticket_id={self.ticket_id}>"


# Functions to handle deposits, withdrawals, and transactions
def handle_deposit(user_id, amount, account_name, account_number):
    try:
        # Update user's balance
        user = User.query.get(user_id)
        user_balance = user.balance
        if not user_balance:
            user_balance = Balance(user_id=user.id, balance=0.0, crypto_balance=0.0)
            db.session.add(user_balance)

        # Add the amount to the balance
        user_balance.balance += amount
        user.balance.balance = user_balance.balance  # Update user balance

        transaction = Transaction(
            user_id=user.id,
            amount=amount,
            account_name=account_name,
            account_number=account_number,
            transaction_type="deposit",
        )
        db.session.add(transaction)
        db.session.commit()
        return {"message": "Deposit successful", "balance": user_balance.balance}
    except IntegrityError as e:
        db.session.rollback()
        return {"message": f"Error: {str(e)}"}


# Function to handle withdrawals
def handle_withdrawal(user_id, amount, account_name, account_number):
    user = User.query.get(user_id)
    user_balance = user.balance
    if user_balance and user_balance.balance >= amount:
        try:
            # Subtract from balance
            user_balance.balance -= amount
            user.balance.balance = user_balance.balance  # Update user balance

            transaction = Transaction(
                user_id=user.id,
                amount=-amount,
                account_name=account_name,
                account_number=account_number,
                transaction_type="withdrawal",
            )
            db.session.add(transaction)
            db.session.commit()
            return {"message": "Withdrawal successful", "balance": user_balance.balance}
        except IntegrityError as e:
            db.session.rollback()
            return {"message": f"Error: {str(e)}"}
    else:
        return {"message": "Insufficient funds for withdrawal"}


# Function to handle Buy Pdes
def handle_buy_pdes(user_id, amount, pdes_buy_price):
    user = User.query.get(user_id)
    total_cost = amount / pdes_buy_price
    user_balance = user.balance

    if user_balance.balance >= amount:
        # Deduct balance and commit
        user_balance.balance -= amount
        db.session.commit()

        # Add PDES to user's crypto balance
        crypto = Crypto.query.filter_by(user_id=user.id, crypto_name="Pdes").first()
        if not crypto:
            crypto = Crypto(
                user_id=user.id,
                crypto_name="Pdes",
                amount=0.0,
                account_address=user.username,
            )
            db.session.add(crypto)
        crypto.amount += total_cost  # Ensure the addition here is correct
        db.session.commit()

        # Record price history after the transaction
        utility = Utility.query.first()
        if utility:
            utility.pdes_circulating_supply += amount
            utility.pdes_supply_left -= amount
            utility.pdes_market_cap = (
                utility.pdes_buy_price * utility.pdes_circulating_supply
            )
            db.session.commit()

        # Ensure high_price and low_price are updated in CoinPriceHistory
        latest_price = CoinPriceHistory.query.order_by(
            CoinPriceHistory.timestamp.desc()
        ).first()

        high_price = (
            max(pdes_buy_price, latest_price.high_price)
            if latest_price
            else pdes_buy_price
        )
        low_price = (
            min(pdes_buy_price, latest_price.low_price)
            if latest_price
            else pdes_buy_price
        )

        coin_price_history = CoinPriceHistory(
            open_price=pdes_buy_price,
            high_price=high_price,
            low_price=low_price,
            close_price=pdes_buy_price,
            volume=amount,
        )
        db.session.add(coin_price_history)
        db.session.commit()

        return (
            {
                "message": "Purchase successful",
                "new_balance": user_balance.balance,
                "new_crypto_amount": crypto.amount,
                "user": user.serialize(),
            }
        ), 200
    else:
        return jsonify({"message": "Insufficient funds to buy Pdes"}), 400


# Function to handle Sell Pdes
def handle_sell_pdes(user_id, amount_in_usd, pdes_sell_price):
    user = User.query.get(user_id)
    user_balance = user.balance
    crypto = Crypto.query.filter_by(user_id=user.id, crypto_name="Pdes").first()

    # Ensure the user's PDES balance is sufficient for the USD equivalent
    if crypto and pdes_sell_price > 0:
        # Calculate the amount in PDES to be deducted
        amount_in_pdes = amount_in_usd / pdes_sell_price

        if crypto.amount >= amount_in_pdes:
            # Update user's balance in USD
            user_balance.balance += amount_in_usd  # Correctly add to user balance
            db.session.commit()

            # Deduct the PDES amount from the user's crypto balance
            crypto.amount -= amount_in_pdes  # Ensure correct subtraction
            db.session.commit()

            # Record the sell transaction
            pdes_transaction = PdesTransaction(
                user_id=user.id,
                action="sell",
                amount=amount_in_pdes,
                price=pdes_sell_price,
                total=amount_in_usd,
            )
            db.session.add(pdes_transaction)

            # Update Utility table (adjust circulating supply, market cap, etc.)
            utility = Utility.query.first()
            current_price = utility.pdes_sell_price if utility else pdes_sell_price

            if utility:
                utility.update_price(price_change_factor=0.99)  # Decrease price by 1%
                utility.pdes_circulating_supply -= amount_in_pdes
                utility.pdes_supply_left += amount_in_pdes
                utility.pdes_market_cap = (
                    utility.pdes_sell_price * utility.pdes_circulating_supply
                )
                db.session.commit()

            # Apply rewards if configured
            reward_config = RewardConfig.query.first()
            if reward_config and reward_config.percentage_weekly > 0:
                reward_earned = amount_in_usd * reward_config.percentage_weekly / 100
                user_balance.rewards += reward_earned
                db.session.commit()
                pdes_transaction.reward_earned = reward_earned
                db.session.commit()

            # Ensure high_price and low_price are not None
            high_price = (
                max(pdes_sell_price, current_price)
                if pdes_sell_price and current_price
                else pdes_sell_price
            )
            low_price = (
                min(pdes_sell_price, current_price)
                if pdes_sell_price and current_price
                else pdes_sell_price
            )

            # Record the transaction details
            coin_price_history = CoinPriceHistory(
                open_price=pdes_sell_price,
                high_price=high_price,
                low_price=low_price,
                close_price=current_price,
                volume=amount_in_pdes,
            )
            db.session.add(coin_price_history)
            db.session.commit()

            # Check if user sold all PDES, reset referral rewards
            if crypto.amount == 0:
                user.referral_reward = 0.0
                db.session.commit()

            return (
                jsonify(
                    {
                        "message": "Sale successful",
                        "new_balance": user_balance.balance,
                        "new_crypto_amount": crypto.amount,
                        "user": user.serialize(),
                    }
                ),
                200,
            )
        else:
            return jsonify({"message": "Insufficient PDES to sell"}), 400
    else:
        return (
            jsonify(
                {
                    "message": "Invalid sell request: insufficient balance or price is zero"
                }
            ),
            400,
        )


def get_pdes_trade_price():
    # Fetch the latest trade price from CoinPriceHistory
    latest_price = CoinPriceHistory.query.order_by(
        CoinPriceHistory.timestamp.desc()
    ).first()
    if latest_price:
        return {"price": latest_price.close_price}
    else:
        return {"message": "No price data available"}


def get_user_activity(user_id):
    deposits = Transaction.query.filter_by(
        user_id=user_id, transaction_type="deposit"
    ).all()
    withdrawals = Transaction.query.filter_by(
        user_id=user_id, transaction_type="withdrawal"
    ).all()
    buys = PdesTransaction.query.filter_by(user_id=user_id, action="buy").all()
    sells = PdesTransaction.query.filter_by(user_id=user_id, action="sell").all()

    return {
        "deposits": [transaction.serialize() for transaction in deposits],
        "withdrawals": [transaction.serialize() for transaction in withdrawals],
        "buys": [transaction.serialize() for transaction in buys],
        "sells": [transaction.serialize() for transaction in sells],
    }


# Function for handling transfers (sending crypto between users)
def handle_transfer(sender_id, receiver_id, amount, crypto_name):
    sender = User.query.get(sender_id)
    receiver = User.query.get(receiver_id)

    # Check if sender has enough crypto balance
    sender_crypto = Crypto.query.filter_by(
        user_id=sender.id, crypto_name=crypto_name
    ).first()

    if sender_crypto and sender_crypto.amount >= amount:
        # Deduct from sender's crypto balance
        sender_crypto.amount -= amount

        # Add to receiver's crypto balance
        receiver_crypto = Crypto.query.filter_by(
            user_id=receiver.id, crypto_name=crypto_name
        ).first()
        if not receiver_crypto:
            receiver_crypto = Crypto(
                user_id=receiver.id,
                crypto_name=crypto_name,
                amount=0.0,
                account_address="",
            )
            db.session.add(receiver_crypto)

        receiver_crypto.amount += amount

        # Record the transaction
        transaction = Transaction(
            user_id=sender.id,
            amount=-amount,
            account_name=receiver.username,
            account_number="",
            transaction_type="transfer",
        )
        db.session.add(transaction)

        db.session.commit()

        return {
            "message": "Transfer successful",
            "new_sender_balance": sender_crypto.amount,
            "new_receiver_balance": receiver_crypto.amount,
        }
    else:
        return {"message": "Insufficient funds for transfer"}


# Function for checking reward eligibility and processing reward distribution
def process_rewards():
    users = User.query.all()
    reward_config = RewardConfig.query.first()  # Assuming a single config exists

    for user in users:
        # Calculate reward based on weekly percentage
        if reward_config:
            reward_amount = user.balance.balance * (
                reward_config.percentage_weekly / 100
            )
            user.balance.rewards += reward_amount

            # Create reward-related transaction
            reward_transaction = Transaction(
                user_id=user.id,
                amount=reward_amount,
                account_name="Reward",
                account_number="",
                transaction_type="reward",
            )
            db.session.add(reward_transaction)

    db.session.commit()

    return {"message": "Rewards processed successfully"}


# Function for adding/adjusting the reward percentage rate
def update_reward_percentage(new_percentage):
    reward_config = RewardConfig.query.first()
    if reward_config:
        reward_config.percentage_weekly = new_percentage
        db.session.commit()
        return {"message": f"Reward percentage updated to {new_percentage}%"}
    else:
        # If no config exists, create one
        reward_config = RewardConfig(percentage_weekly=new_percentage)
        db.session.add(reward_config)
        db.session.commit()
        return {"message": f"Reward percentage set to {new_percentage}%"}


# Function for calculating the total balance of a user's cryptos
def calculate_total_balance(user_id):
    # Fetch the user's cryptos
    cryptos = Crypto.query.filter_by(user_id=user_id).all()

    # Initialize total balance to 0
    total_balance = 0.0

    # Sum up the amount of each cryptocurrency the user holds
    for crypto in cryptos:
        total_balance += crypto.amount

    return total_balance
