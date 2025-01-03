from app import db

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    transactions = db.relationship('Transaction', backref='user', lazy=True)
    cryptos = db.relationship('Crypto', backref='user', lazy=True)
    balance = db.relationship('Balance', uselist=False, backref='user')

    __table_args__ = (
        db.CheckConstraint('balance >= 0', name='ck_user_balance_nonnegative'),
    )

    referral_code = db.Column(db.String(16), unique=True, nullable=True)
    referrer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    referrals = db.relationship('User', backref=db.backref('referrer', remote_side=[id]), lazy=True)

    total_referrals = db.Column(db.Integer, default=0)
    referral_reward = db.Column(db.Float, default=0.0)

    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    # Return a serialize info
    def serialize(self):
        # If no balance is found, default to 0.0
        balance = self.balance.balance if self.balance else 0.0

        # Calculate total crypto_balance (sum of all crypto balances)
        total_crypto_balance = sum(crypto.crypto_balance for crypto in self.cryptos) if self.cryptos else 0.0

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
            "created_at": self.created_at.isoformat(),
        }


# Balance model
class Balance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    balance = db.Column(db.Float, nullable=False, default=0.0)
    crypto_balance = db.Column(db.Float, nullable=False, default=0.0)

# Transaction model
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    account_name = db.Column(db.String(100), nullable=False)
    account_number = db.Column(db.String(20), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    # Return a serialize info
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "account_name": self.account_name,
            "account_number": self.account_number,
            "transaction_type": self.transaction_type,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),}

# Crypto model
class Crypto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
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
