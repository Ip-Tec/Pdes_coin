import datetime
from app import db
from app.user_balance_checker import correct_user_balance
from apscheduler.schedulers.background import BackgroundScheduler
from app.models import User, RewardSetting, Utility, Transaction, Balance


def reward_pdes_holders():
    """Calculate and distribute rewards to users who own PDES coins."""
    try:
        print(f"Reward job started at {datetime.datetime.utcnow()}")

        # Fetch users with a PDES balance
        pdes_users = Balance.query.filter(
            Balance.crypto_symbol == "PDES", Balance.amount > 0
        ).all()

        # Fetch the reward percentage from the Utility table
        utility = Utility.query.first()
        reward_percentage = utility.reward_percentage

        for user_balance in pdes_users:
            reward = user_balance.amount * reward_percentage
            user_balance.amount += reward  # Update the user's PDES balance
            print(f"Rewarded {reward} PDES to User ID: {user_balance.user_id}")

        # Commit changes to the database
        db.session.commit()
        print("Reward job completed successfully.")
    except Exception as e:
        print(f"Error during reward distribution: {e}")

def correct_user_balance_with_context(app):
    """Run the correct_user_balance function inside the app context."""
    with app.app_context():
        flagged_accounts = correct_user_balance()
        print(f"Flagged accounts: {flagged_accounts}")

def calculate_weekly_rewards(app):
    """Distribute weekly rewards for PDES purchases."""
    with app.app_context():
        reward_setting = RewardSetting.query.first()
        if not reward_setting or reward_setting.weekly_percentage <= 0:
            print("No valid reward setting configured!")
            return

        # Calculate daily rate (weekly_percentage divided by 7 days and converted to decimal)
        daily_rate = reward_setting.weekly_percentage / 7 / 100

        # Fetch eligible users
        users = User.query.filter(User.last_reward_date.isnot(None)).all()
        for user in users:
            if user.balance and user.balance.balance > 0:
                # Use total_seconds() to capture fractional days
                time_delta = datetime.datetime.utcnow() - user.last_reward_date
                days_since_reward = time_delta.total_seconds() / 86400  # seconds in a day
                
                # If days_since_reward is very small, you might want to skip to avoid negligible rewards
                if days_since_reward < 0.01:
                    continue

                reward_amount = user.balance.balance * daily_rate * days_since_reward

                # Update user balance and rewards
                user.balance.balance += reward_amount
                user.balance.rewards += reward_amount
                user.last_reward_date = datetime.datetime.utcnow()
                
                print(f"User {user.id} rewarded: {reward_amount:.4f} PDES (for {days_since_reward:.2f} days)")

        # Commit all changes at once
        db.session.commit()
        print("Weekly rewards calculation completed.")

def calculate_daily_rewards(app):
    """Distribute daily rewards for PDES purchases."""
    with app.app_context():
        reward_setting = RewardSetting.query.first()
        if not reward_setting or reward_setting.daily_percentage <= 0:
            print("No valid reward setting configured!")
            return

        # Calculate daily rate (daily_percentage divided by 100)
        daily_rate = reward_setting.daily_percentage / 100

        # Fetch eligible users
        users = User.query.filter(User.last_reward_date.isnot(None)).all()
        for user in users:
            if user.balance and user.balance.balance > 0:
                # Use total_seconds() to capture fractional days
                time_delta = datetime.datetime.utcnow() - user.last_reward_date
                days_since_reward = time_delta.total_seconds() / 86400  # seconds in a day

                # If days_since_reward is very small, you might want to skip to avoid negligible rewards
                if days_since_reward < 0.01:
                    continue

                reward_amount = user.balance.balance * daily_rate * days_since_reward

                # Update user balance and rewards
                user.balance.balance += reward_amount
                user.balance.rewards += reward_amount
                user.last_reward_date = datetime.datetime.utcnow()

                print(f"User {user.id} rewarded: {reward_amount:.4f} PDES (for {days_since_reward:.2f} days)")

        # Commit all changes at once
        db.session.commit()
        print("Daily rewards calculation completed.")

def setup_scheduler(app):
    """Setup the task scheduler."""
    scheduler = BackgroundScheduler()

    # Reward PDES holders once a month
    scheduler.add_job(
        reward_pdes_holders, "interval", weeks=4
    )  # Monthly reward for PDES holders

    # Reward PDES holders once a month
    scheduler.add_job(
        lambda: correct_user_balance_with_context(app), "interval", days=4
    )  # Daily check for stored balance

    scheduler.add_job(
        calculate_weekly_rewards, "interval", hours=6, args=[app]
    )  # Passing app to the function
    scheduler.start()
    print("Scheduler started!")

