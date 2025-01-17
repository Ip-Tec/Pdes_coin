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

    role = db.Column(db.String(20), nullable=False, default="user")
    last_reward_date = db.Column(db.DateTime, nullable=True)

    transactions = db.relationship("Transaction", backref="user", lazy=True)
    cryptos = db.relationship("Crypto", backref="user", lazy=True)
    balance = db.relationship("Balance", uselist=False, backref="user")

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
            "role": self.role,
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
            "full_name": self.name,
            "username": self.username,
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
            "crypto_balance": self.crypto_balance,
            "rewards": self.rewards,
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


# Transaction model
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    account_name = db.Column(db.String(100), nullable=False)
    account_number = db.Column(db.String(20), nullable=True)
    btc_address = db.Column(db.String(20), nullable=True)
    transaction_type = db.Column(db.String(20), nullable=False)
    transaction_completed = db.Column(db.Boolean, default=False)
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
    reward_percentage = db.Column(db.Float, nullable=False, default=25.0)  # default 25%
    referral_percentage = db.Column(db.Float, nullable=False, default=5.0)  # default 5%
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
            "reward_percentage": self.reward_percentage,
            "referral_percentage": self.referral_percentage,
            "pdes_circulating_supply": self.pdes_circulating_supply,
        }


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
def handle_buy_pdes(user_id, amount, price_per_coin):
    user = User.query.get(user_id)
    total_cost = amount * price_per_coin
    user_balance = user.balance

    # Ensure the user has enough balance to buy Pdes
    if user_balance.balance >= total_cost:
        user_balance.balance -= total_cost
        user.balance.balance = user_balance.balance  # Update user balance

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


# Function to handle Sell Pdes
def handle_sell_pdes(user_id, amount, price_per_coin):
    user = User.query.get(user_id)
    crypto = Crypto.query.filter_by(user_id=user.id, crypto_name="Pdes").first()

    # Ensure the user has enough Pdes to sell
    if crypto and crypto.amount >= amount:
        total_sale = amount * price_per_coin
        user_balance = user.balance
        user_balance.balance += total_sale
        user.balance.balance = user_balance.balance  # Update user balance
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
            "new_crypto_amount": crypto.amount,
        }
    else:
        return {"message": "Insufficient Pdes to sell"}


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
