from app import db
from sqlalchemy.exc import IntegrityError


# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    refresh_key = db.Column(db.String(128))

    transactions = db.relationship("Transaction", backref="user", lazy=True)
    cryptos = db.relationship("Crypto", backref="user", lazy=True)
    balance = db.relationship("Balance", uselist=False, backref="user")

    __table_args__ = (
        db.CheckConstraint("balance >= 0", name="ck_user_balance_nonnegative"),
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
            "email": self.email,
            "full_name": self.name,
            "username": self.username,
            "balance": balance,
            "crypto_balance": total_crypto_balance,
            "referral_code": self.referral_code,
            "total_referrals": self.total_referrals,
            "referral_reward": self.referral_reward,
            "created_at": self.created_at.isoformat() if self.created_at else "",
        }


# Balance model
class Balance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    balance = db.Column(db.Float, nullable=False, default=0.0)
    crypto_balance = db.Column(db.Float, nullable=False, default=0.0)


# Transaction model
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    account_name = db.Column(db.String(100), nullable=False)
    account_number = db.Column(db.String(20), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    # Return a serialize info
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "account_name": self.account_name,
            "account_number": self.account_number,
            "transaction_type": self.transaction_type,
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


# PdesTransaction model for handling buy/sell of Pdes coin
class PdesTransaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    action = db.Column(db.String(10), nullable=False)  # 'buy' or 'sell'
    amount = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "amount": self.amount,
            "price": self.price,
            "total": self.total,
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


class Utility(db.Model):
    __tablename__ = "utility"
    
    id = db.Column(db.Integer, primary_key=True)
    pdes_price = db.Column(db.Float, nullable=False)
    pdes_market_cap = db.Column(db.Float, nullable=False)
    pdes_circulating_supply = db.Column(db.Float, nullable=False)
    conversion_rate = db.Column(db.Float, nullable=False, default=1980)
    pdes_supply_left = db.Column(db.Float, nullable=False, default=8000000000.0)
    pdes_total_supply = db.Column(db.Float, nullable=False, default=8000000000.0)

    def serialize(self):
        return {
            "id": self.id,
            "pdes_price": self.pdes_price,
            "conversion_rate": self.conversion_rate,
            "pdes_market_cap": self.pdes_market_cap,
            "pdes_supply_left": self.pdes_supply_left,
            "pdes_total_supply": self.pdes_total_supply,
            "pdes_circulating_supply": self.pdes_circulating_supply,
        }


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
    PDESAddres = db.Column(
        db.String(30), db.ForeignKey("user.username"), nullable=False
    )

    def serialize(self):
        return {
            "id": self.id,
            "usder_id": self.user_id,
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
        self.PDESAddres = data["PDESAddres"]


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


def handle_withdrawal(user_id, amount, account_name, account_number):
    user = User.query.get(user_id)
    user_balance = user.balance
    if user_balance and user_balance.balance >= amount:
        try:
            # Subtract from balance
            user_balance.balance -= amount
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


def handle_buy_pdes(user_id, amount, price_per_coin):
    user = User.query.get(user_id)
    total_cost = amount * price_per_coin
    user_balance = user.balance

    # Ensure the user has enough balance to buy Pdes
    if user_balance.balance >= total_cost:
        user_balance.balance -= total_cost

        # Add Pdes coin to the user's crypto balance
        crypto = Crypto.query.filter_by(user_id=user.id, crypto_name="Pdes").first()
        if not crypto:
            crypto = Crypto(
                user_id=user.id, crypto_name="Pdes", amount=0.0, account_address=""
            )  # No address required yet
            db.session.add(crypto)

        crypto.amount += amount

        # Record the transaction
        pdes_transaction = PdesTransaction(
            user_id=user.id,
            action="buy",
            amount=amount,
            price=price_per_coin,
            total=total_cost,
        )
        db.session.add(pdes_transaction)
        db.session.commit()

        return {
            "message": "Purchase successful",
            "new_balance": user_balance.balance,
            "new_crypto_amount": crypto.amount,
        }
    else:
        return {"message": "Insufficient funds to buy Pdes"}


def handle_sell_pdes(user_id, amount, price_per_coin):
    user = User.query.get(user_id)
    crypto = Crypto.query.filter_by(user_id=user.id, crypto_name="Pdes").first()

    # Ensure the user has enough Pdes to sell
    if crypto and crypto.amount >= amount:
        total_sale = amount * price_per_coin
        user_balance = user.balance
        user_balance.balance += total_sale
        crypto.amount -= amount

        # Record the transaction
        pdes_transaction = PdesTransaction(
            user_id=user.id,
            action="sell",
            amount=amount,
            price=price_per_coin,
            total=total_sale,
        )
        db.session.add(pdes_transaction)
        db.session.commit()

        return {
            "message": "Sale successful",
            "new_balance": user_balance.balance,
            "remaining_crypto_amount": crypto.amount,
        }
    else:
        return {"message": "Insufficient Pdes coins to sell"}


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
