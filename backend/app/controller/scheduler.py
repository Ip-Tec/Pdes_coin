import datetime
from app import db
from app.models import User, RewardSetting, Utility, Transaction, Balance
from apscheduler.schedulers.background import BackgroundScheduler


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


def calculate_weekly_rewards(app):
    """Distribute weekly rewards for PDES purchases."""
    with app.app_context():
        reward_setting = RewardSetting.query.first()
        if not reward_setting or reward_setting.weekly_percentage <= 0:
            print("No valid reward setting configured!")
            return

        # Calculate daily rate
        daily_rate = reward_setting.weekly_percentage / 7 / 100  # Convert to decimal

        # Fetch eligible users
        users = User.query.filter(User.last_reward_date.isnot(None)).all()
        for user in users:
            if user.balance and user.balance.balance > 0:
                days_since_reward = (
                    datetime.datetime.utcnow() - user.last_reward_date
                ).days
                reward_amount = user.balance.balance * daily_rate * days_since_reward

                # Update user balance and rewards
                user.balance.balance += reward_amount
                user.balance.rewards += reward_amount
                user.last_reward_date = datetime.datetime.utcnow()

        # Commit all changes at once
        db.session.commit()
        print("Weekly rewards calculation completed.")


def setup_scheduler(app):
    """Setup the task scheduler."""
    scheduler = BackgroundScheduler()

    # Reward PDES holders once a month
    # scheduler.add_job(reward_pdes_holders, "interval", weeks=4, args=[app])  # Monthly reward for PDES holders

    scheduler.add_job(
        calculate_weekly_rewards, "interval", hours=0.02, args=[app]
    )  # Passing app to the function
    scheduler.start()
    print("Scheduler started!")
