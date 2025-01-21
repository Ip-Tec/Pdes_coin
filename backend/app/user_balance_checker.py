
from datetime import datetime, timedelta
from app import db
from app.models import Crypto, Transaction, User

def correct_user_balance():
    flagged_accounts = []

    users = User.query.all()  # Fetch all users from the database
    for user in users:
        # Initialize recalculated balances
        recalculated_balance = 0.0
        recalculated_crypto_balance = 0.0
        total_rewards = 0.0

        # Calculate the user's fiat balance from transactions
        transactions = Transaction.query.filter_by(user_id=user.id, transaction_completed=True).all()
        for transaction in transactions:
            if transaction.transaction_type.lower() == "deposit":
                recalculated_balance += transaction.amount
            elif transaction.transaction_type.lower() == "withdrawal":
                recalculated_balance -= transaction.amount

        # Calculate the user's crypto balance
        cryptos = Crypto.query.filter_by(user_id=user.id).all()
        for crypto in cryptos:
            recalculated_crypto_balance += crypto.amount

        # Calculate rewards (weekly accumulation)
        if user.last_reward_date:
            weeks_since_last_reward = (datetime.utcnow() - user.last_reward_date).days // 7
            total_rewards = weeks_since_last_reward * user.balance.rewards

        # Add rewards to recalculated balance
        recalculated_balance += total_rewards

        # Check if the balances match the stored values
        if (
            abs(user.balance.balance - recalculated_balance) > 0.01 or
            abs(user.balance.crypto_balance - recalculated_crypto_balance) > 0.01
        ):
            # Flagging the account if the balances exceed expected values
            flagged_accounts.append({
                "user_id": user.id,
                "username": user.username,
                "expected_balance": recalculated_balance,
                "stored_balance": user.balance.balance,
                "expected_crypto_balance": recalculated_crypto_balance,
                "stored_crypto_balance": user.balance.crypto_balance,
            })

            # Optionally, update the balances to the recalculated values
            user.balance.balance = recalculated_balance
            user.balance.crypto_balance = recalculated_crypto_balance
            user.last_reward_date = datetime.utcnow()  # Reset reward calculation date
            db.session.commit()

    return flagged_accounts
