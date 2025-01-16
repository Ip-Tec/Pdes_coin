import datetime
from app import app, db
from models import User, RewardSetting, Utility, Transaction
from apscheduler.schedulers.background import BackgroundScheduler

def calculate_referral_rewards():
    """Distribute referral rewards based on deposits."""
    with app.app_context():
        users = User.query.filter(User.referrer_id.isnot(None)).all()
        for user in users:
            # Fetch referrer
            referrer = User.query.get(user.referrer_id)
            if referrer:
                # Fetch the deposit transactions for the user
                deposits = Transaction.query.filter_by(
                    user_id=user.id, transaction_type="deposit"
                ).all()
                for deposit in deposits:
                    reward_percentage = Utility.query.first().conversion_rate / 100
                    reward_amount = deposit.amount * reward_percentage

                    # Credit reward to referrer
                    referrer.balance.balance += reward_amount
                    referrer.referral_reward += reward_amount
                    db.session.commit()


def calculate_weekly_rewards():
    """Distribute weekly rewards for PDES purchases."""
    with app.app_context():
        reward_setting = RewardSetting.query.first()
        if not reward_setting:
            print("No reward setting configured!")
            return

        # Calculate daily rate
        daily_rate = reward_setting.weekly_percentage / 7

        # Fetch eligible users
        users = User.query.filter(User.last_reward_date.isnot(None)).all()
        for user in users:
            days_since_reward = (datetime.utcnow() - user.last_reward_date).days
            reward_amount = user.balance.balance * (daily_rate / 100) * days_since_reward

            # Credit user balance
            user.balance.balance += reward_amount
            user.balance.rewards += reward_amount
            user.last_reward_date = datetime.utcnow()
            db.session.commit()


def setup_scheduler():
    """Setup the task scheduler."""
    scheduler = BackgroundScheduler()
    scheduler.add_job(calculate_referral_rewards, "interval", hours=1)  # Run hourly
    scheduler.add_job(calculate_weekly_rewards, "interval", days=1)  # Run daily
    return scheduler
