from sqlite3 import IntegrityError
import jwt
import logging
import traceback
from datetime import date, datetime, timezone, timedelta
from app import db
from app.models import (
    AccountDetail,
    Deposit,
    DepositAccount,
    RewardConfig,
    User,
    Transaction,
    Crypto,
    Balance,
    PdesTransaction,
    CoinPriceHistory,
    Utility,
    PdesTransaction,
    handle_buy_pdes,
    handle_sell_pdes,
)
from sqlalchemy.sql import or_, desc, asc
from app.access_level import AccessLevel

# from sqlalchemy.sql.expression import case
from app.user_balance_checker import correct_user_balance
from flask import request, jsonify
from app.key_gen import generate_key
from app.services import token_required
from app.utils import validate_required_param
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import case, func
import random


class UserTransactionsController:
    """
    Controller for user transactions
    """

    @staticmethod
    @token_required
    def get_all_transactions():
        transactions = Transaction.query.all()
        transaction_data = [transaction.serialize() for transaction in transactions]
        return jsonify({"transactions": transaction_data}), 200

    @staticmethod
    @token_required
    def get_transactions(current_user):
        if not current_user:
            return jsonify({"message": "User not authenticated!"}), 401

        transactions = Transaction.query.filter_by(user_id=current_user.id).all()
        transaction_data = [transaction.serialize() for transaction in transactions]
        # print(f"transaction_data::: {transaction_data}")
        return jsonify({"transactions": transaction_data}), 200

    @staticmethod
    @token_required
    def get_transaction(id):
        user_id = request.user_id
        transaction = Transaction.query.filter_by(user_id=user_id, id=id).first()
        return jsonify({"message": transaction.serialize()}), 200

    # Get 3 weeks of Socket Transactions
    def get_transactions_socket():
         # Get the date 3 weeks ago from today
        three_weeks_ago = datetime.now() - timedelta(weeks=3)
        
        # Fetch all deposit or withdraw transactions from the last 3 weeks
        transactions = Transaction.query.filter(
            Transaction.created_at >= three_weeks_ago,  # Filter by date for last 3 weeks
            or_(
                Transaction.transaction_type.like("%deposit%"),
                Transaction.transaction_type.like("%withdraw%")
            ),
        ).order_by(desc(Transaction.created_at)).all()
        
        transaction_data = [transaction.serialize() for transaction in transactions]
        return transaction_data
    
    # Get all transactions for web Socket
    def get_all_transactions_socket():
        transactions = Transaction.query.order_by(desc(Transaction.created_at)).all()
        transaction_data = [transaction.serialize() for transaction in transactions]
        return transaction_data


    @staticmethod
    @token_required
    def add_transaction():
        user_id = request.user_id
        data = request.get_json()
        transaction = Transaction(
            user_id=user_id,
            amount=data["amount"],
            account_name=data["account_name"],
            account_number=data["account_number"],
            transaction_type=data["transaction_type"],
        )
        db.session.add(transaction)
        db.session.commit()
        return jsonify({"message": transaction.serialize()}), 201

    @staticmethod
    @token_required
    def update_transaction():
        user_id = request.user_id
        data = request.get_json()
        transaction = Transaction.query.filter_by(
            user_id=user_id, id=data["id"]
        ).first()
        transaction.amount = data["amount"]
        transaction.account_name = data["account_name"]
        transaction.account_number = data["account_number"]
        transaction.transaction_type = data["transaction_type"]
        db.session.commit()
        return jsonify({"message": transaction.serialize()}), 200

    @staticmethod
    @token_required
    def delete_transaction():
        user_id = request.user_id
        data = request.get_json()
        transaction = Transaction.query.filter_by(
            user_id=user_id, id=data["id"]
        ).first()
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({"message": "Transaction deleted successfully"}), 200

    @staticmethod
    @token_required
    def user_add_deposit(current_user, *args, **kwargs):
        """
        User route to add a deposit record.
        Expects JSON input:
        {
            "user_id": int,
            "admin_id": int,
            "amount": float,
            "currency": str,  # Optional, defaults to "naira"
            "transaction_id": str,  # Must be unique
            "deposit_method": str,  # Method of deposit, e.g., "bank transfer"
        }
        """
        data = request.get_json()

        # Validate required fields
        required_fields = [
            "user_id",
            "admin_id",
            "amount",
            "transaction_id",
            "deposit_method",
        ]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return (
                jsonify(
                    {"error": f"Missing required fields: {', '.join(missing_fields)}"}
                ),
                400,
            )

        try:
            # Extract data and set defaults
            user_id = data["user_id"]
            admin_id = data["admin_id"]
            amount = data["amount"]
            currency = data.get("currency", "naira")  # Default to "naira"
            transaction_id = data["transaction_id"]
            deposit_method = data["deposit_method"]

            # Validate admin account exists
            admin_account = DepositAccount.query.get(admin_id)
            if not admin_account:
                return jsonify({"error": "Admin account not found"}), 404

            # Get the total deposit for today for the admin
            total_deposit = (
                db.session.query(func.coalesce(func.sum(Deposit.amount), 0))
                .filter(
                    Deposit.admin_id == admin_id,  # Filter by admin ID
                    func.date(Deposit.created_at) == date.today(),  # Today's deposits
                )
                .scalar()
            )

            # print(f"{total_deposit=}")  # Debug log for total deposits

            # Check if the admin account has space for this deposit
            if total_deposit + amount > admin_account.max_deposit_amount:
                return (
                    jsonify({"error": "Deposit exceeds the admin's account limit"}),
                    400,
                )

            # Check if transaction ID is unique
            existing_deposit = Deposit.query.filter_by(
                transaction_id=transaction_id
            ).first()
            if existing_deposit:
                return jsonify({"error": "Transaction ID already exists"}), 400

            # Create a new Deposit record
            new_deposit = Deposit(
                user_id=user_id,
                admin_id=admin_id,
                amount=amount,
                currency=currency,
                transaction_id=transaction_id,
                deposit_method=deposit_method,
                status="pending",  # Default to pending
            )

            # Add the deposit record to the database
            db.session.add(new_deposit)
            db.session.commit()

            return (
                jsonify(
                    {
                        "message": "Deposit added successfully",
                        "deposit": new_deposit.serialize(),
                    }
                ),
                201,
            )

        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Transaction ID must be unique"}), 400

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    @staticmethod
    @token_required
    def withdraw_money(user):
        try:
            user_id = user.id
            data = request.get_json()

            # Extract accountDetails from the input payload
            account_details = data
            if not account_details:
                return jsonify({"error": "Account details are missing."}), 400

            # Validate required fields in accountDetails
            required_fields = ["accountName", "accountType", "amount"]
            for field in required_fields:
                if field not in account_details or not account_details[field]:
                    return jsonify({"error": f"'{field}' field is required."}), 400

            # Validate accountNumber or cryptoAddress
            if not account_details.get("accountNumber") and not account_details.get(
                "cryptoAddress"
            ):
                return (
                    jsonify(
                        {"error": "Provide either 'accountNumber' or 'cryptoAddress'."}
                    ),
                    400,
                )

            if account_details.get("accountNumber") and account_details.get(
                "cryptoAddress"
            ):
                return (
                    jsonify(
                        {
                            "error": "Provide either 'accountNumber' or 'cryptoAddress', not both."
                        }
                    ),
                    400,
                )

            # Parse and validate the amount
            try:
                amount = float(account_details["amount"])
                if amount <= 0:
                    return (
                        jsonify({"error": "'amount' must be greater than zero."}),
                        400,
                    )
            except (ValueError, TypeError):
                return jsonify({"error": "'amount' must be a number."}), 400

            # Retrieve the user's balance
            balance = Balance.query.filter_by(user_id=user_id).first()
            if not balance:
                return jsonify({"error": "Balance record not found."}), 400
            if balance.balance < amount:
                return jsonify({"error": "Insufficient balance."}), 400

            # Create a new transaction record
            transaction = Transaction(
                user_id=user_id,
                amount=-amount,
                currency=account_details.get("type", "naira"),  # Default to "naira"
                transaction_completed=False,
                account_name=account_details["accountName"],
                crypto_address=account_details.get(
                    "cryptoAddress", ""
                ),  # Default to empty string
                account_number=account_details.get("accountNumber", ""),
                transaction_type=f"withdraw + {account_details['accountType']}",
            )
            db.session.add(transaction)

            # Deduct the amount from the user's balance
            balance.balance -= amount

            # Commit the transaction
            db.session.commit()

            # Return success response
            return (
                jsonify(
                    {
                        "message": "Withdrawal in Progress",
                        "data": transaction.serialize(),
                    }
                ),
                201,
            )

        except Exception as e:
            db.session.rollback()
            # Log the exception for debugging purposes
            print(f"Error during withdrawal: {e}")
            return (
                jsonify({"error": "Transaction failed due to an unexpected error."}),
                500,
            )


def get_pdes_coin_details():
    try:
        # Fetch the latest Utility data
        utility = Utility.query.first()

        if not utility:
            return {"message": "Pdes coin details not found"}

        # Construct the response with current data
        return {
            "id": utility.id,  # Removed the braces here
            "pdes_buy_price": utility.pdes_buy_price,
            "pdes_sell_price": utility.pdes_sell_price,
            "conversion_rate": utility.conversion_rate,
            "pdes_market_cap": utility.pdes_market_cap,
            "pdes_supply_left": utility.pdes_supply_left,
            "pdes_total_supply": utility.pdes_total_supply,
            "pdes_circulating_supply": utility.pdes_circulating_supply,
        }
    except Exception as e:
        return {"message": f"An error occurred: {str(e)}"}


class AccountService:
    """
    Service for managing user account details
    """

    @staticmethod
    @token_required
    def get_account_details(user_details):
        user = user_details
        if not user:
            return jsonify({"message": "User not found"}), 404

        account_details = AccountDetail.query.filter_by(user_id=user.id).first()
        if not account_details:
            return jsonify({"message": "Account details not found"}), 404

        return {
            "id": account_details.id,
            "BTCAddress": account_details.BTCAddress,
            "BTCAddressSeed": account_details.BTCAddressSeed,
            "ETHAddress": account_details.ETHAddress,
            "ETHAddressSeed": account_details.ETHAddressSeed,
            "LTCAddress": account_details.LTCAddress,
            "LTCAddressSeed": account_details.LTCAddressSeed,
            "USDCAddress": account_details.USDCAddress,
            "USDCAddressSeed": account_details.USDCAddressSeed,
        }

    # Get admin account details
    @staticmethod
    @token_required
    def get_random_deposit_account(current_user, *args, **kwargs):
        # Get the start and end of the current day in UTC
        today_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        today_end = datetime.now(timezone.utc).replace(
            hour=23, minute=59, second=59, microsecond=999999
        )

        # Query eligible accounts directly from the database
        try:
            # Build the query for eligible deposit accounts
            eligible_accounts_query = (
                db.session.query(DepositAccount)
                .outerjoin(Deposit, DepositAccount.id == Deposit.admin_id)
                .group_by(DepositAccount.id)
                .having(
                    func.coalesce(
                        func.sum(
                            case(
                                (
                                    Deposit.created_at.between(today_start, today_end),
                                    Deposit.amount,
                                ),  # Corrected condition
                                else_=0,  # Provide default value for the case statement
                            )
                        ),
                        0,  # Default value for coalesce if no rows match
                    )
                    < DepositAccount.max_deposit_amount
                )
            )

            eligible_accounts = eligible_accounts_query.all()

            # Check if any accounts are eligible
            if not eligible_accounts:
                return jsonify({"message": "No eligible accounts available"}), 404

            # Select a random eligible account
            random_account = random.choice(eligible_accounts)

            # Serialize and return the account details
            return jsonify(random_account.serialize())

        except Exception as e:
            print(f"Error occurred: {str(e)}")  # Log the error for debugging
            return jsonify({"message": "Internal Server Error", "error": str(e)}), 500


# # Setting up logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)


# PDES service
class PdesService:
    """PDES service for buying and selling PDES coins"""

    # Buy PDES coin
    @staticmethod
    @token_required
    def buy_pdes(current_user, *args, **kwargs):
        user_id = current_user.id
        data = request.get_json()

        # Validate required fields
        required_fields = ["amount", "price"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field} is required"}), 400

        amount = data["amount"]
        price = data["price"]

        # print(f"{data=}")

        if amount <= 0 or price <= 0:
            return jsonify({"error": "Amount and price must be positive numbers"}), 400

        # Get the latest PDES price
        utility_entry = Utility.query.order_by(Utility.id.desc()).first()
        if not utility_entry:
            return jsonify({"error": "No price data available"}), 500

        pdes_buy_price = utility_entry.pdes_buy_price

        return handle_buy_pdes(
            user_id=user_id, amount=amount, pdes_buy_price=pdes_buy_price
        )

        # try:
        #     # Fetch user's balance
        #     balance = Balance.query.filter_by(user_id=user_id).first()
        #     if not balance:
        #         return jsonify({"error": "User balance not found"}), 404

        #     total_cost = amount * price

        #     if balance.balance < total_cost:
        #         return jsonify({"error": "Insufficient balance"}), 400

        #     # Deduct balance
        #     balance.balance -= total_cost

        #     # Create buy transaction
        #     pdes_transaction = PdesTransaction(
        #         user_id=user_id,
        #         action="buy",
        #         amount=amount,
        #         price=price,
        #         total=total_cost,
        #     )
        #     db.session.add(pdes_transaction)

        #     # Update coin price history for buy action
        #     coin_price_history = CoinPriceHistory(
        #         crypto_name="PDES",
        #         price=price,
        #         action="buy",
        #         timestamp=datetime.utcnow(),
        #     )
        #     db.session.add(coin_price_history)

        #     # Adjust price due to increased demand (increase price by 1%)
        #     utility = Utility.query.first()
        #     if utility:
        #         new_price = price * 1.01  # Increase by 1% for demand
        #         utility.update_price(new_price)  # Assuming there's a method for updating price
        #         db.session.commit()

        #     # Apply rewards if configured
        #     reward_config = RewardConfig.query.first()
        #     if reward_config and reward_config.percentage_weekly > 0:
        #         reward_earned = total_cost * reward_config.percentage_weekly / 100
        #         balance.rewards += reward_earned
        #         db.session.commit()
        #         pdes_transaction.reward_earned = reward_earned
        #         db.session.commit()

        #     # Commit transaction
        #     db.session.commit()

        #     return (
        #         jsonify(
        #             {
        #                 "status": "success",
        #                 "message": "PDES coins purchased successfully",
        #                 "transaction": pdes_transaction.serialize(),
        #                 "balance": {"remaining_balance": balance.balance},
        #             }
        #         ),
        #         201,
        #     )
        # except SQLAlchemyError as e:
        #     db.session.rollback()
        #     return jsonify({"error": "Transaction failed"}), 500

    # Sell PDES coin
    @staticmethod
    @token_required
    def sell_pdes(current_user, *args, **kwargs):
        user_id = current_user.id
        data = request.get_json()

        # Validate required fields
        required_fields = ["amount", "price"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field} is required"}), 400

        amount = data["amount"]
        price = data["price"]

        # print(f"{data=}")

        if amount <= 0 or price <= 0:
            return jsonify({"error": "Amount and price must be positive numbers"}), 400

        # Get the latest PDES price
        utility_entry = Utility.query.order_by(Utility.id.desc()).first()
        if not utility_entry:
            return jsonify({"error": "No price data available"}), 500

        pdes_sell_price = utility_entry.pdes_sell_price

        # print(f"{correct_user_balance()=}")

        return handle_sell_pdes(
            user_id=user_id, amount_in_usd=amount, pdes_sell_price=pdes_sell_price
        )

        # try:
        #     # Fetch user's PDES balance
        #     crypto_balance = Crypto.query.filter_by(user_id=user_id, crypto_name="PDES").first()
        #     if not crypto_balance or crypto_balance.amount < amount:
        #         return jsonify({"error": "Insufficient PDES balance"}), 400

        #     total_income = amount * price

        #     # Deduct PDES balance
        #     crypto_balance.amount -= amount

        #     # Create sell transaction
        #     pdes_transaction = PdesTransaction(
        #         user_id=user_id,
        #         action="sell",
        #         amount=amount,
        #         price=price,
        #         total=total_income,
        #     )
        #     db.session.add(pdes_transaction)

        #     # Update user's balance
        #     balance = Balance.query.filter_by(user_id=user_id).first()
        #     if not balance:
        #         return jsonify({"error": "User balance not found"}), 404
        #     balance.balance += total_income

        #     # Update coin price history for sell action
        #     coin_price_history = CoinPriceHistory(
        #         crypto_name="PDES",
        #         price=price,
        #         action="sell",
        #         timestamp=datetime.datetime.utcnow(),
        #     )
        #     db.session.add(coin_price_history)

        #     # Adjust price due to selling pressure (decrease price by 1%)
        #     utility = Utility.query.first()
        #     if utility:
        #         new_price = price * 0.99  # Decrease by 1% for selling pressure
        #         utility.update_price(new_price)  # Assuming there's a method for updating price
        #         db.session.commit()

        #     # Apply rewards if configured
        #     reward_config = RewardConfig.query.first()
        #     if reward_config and reward_config.percentage_weekly > 0:
        #         reward_earned = total_income * reward_config.percentage_weekly / 100
        #         balance.rewards += reward_earned
        #         db.session.commit()
        #         pdes_transaction.reward_earned = reward_earned
        #         db.session.commit()

        #     # Check if user sold all PDES, reset rewards if needed
        #     if crypto_balance.amount == 0:
        #         balance.rewards = 0  # Reset rewards if all coins are sold
        #         db.session.commit()

        #     db.session.commit()

        #     return (
        #         jsonify(
        #             {
        #                 "status": "success",
        #                 "message": "PDES coins sold successfully",
        #                 "transaction": pdes_transaction.serialize(),
        #                 "balance": {
        #                     "remaining_balance": balance.balance,
        #                     "crypto_balance": crypto_balance.amount,
        #                 },
        #             }
        #         ),
        #         201,
        #     )
        # except SQLAlchemyError as e:
        #     db.session.rollback()
        #     return jsonify({"error": "Transaction failed"}), 500

    # Get PDES price history for ChartJS
    @staticmethod
    @token_required
    def get_pdes_price_history(current_user):
        # Fetch data from CoinPriceHistory
        price_history = CoinPriceHistory.query.order_by(
            CoinPriceHistory.timestamp
        ).all()

        return jsonify([entry.serialize() for entry in price_history]), 200
    
    # Get PDES price history for Line Charts in ChartJS
    @token_required
    def get_pdes_trade_history(current_user, *args, **kwargs):
        # Define time range: Last 24 hours
        time_limit = datetime.utcnow() - timedelta(hours=24)

        # Fetch data from CoinPriceHistory for the last 24 hours
        price_data = (
            db.session.query(
                CoinPriceHistory.timestamp,
                CoinPriceHistory.open_price.label("buy_price"),
                CoinPriceHistory.close_price.label("sell_price"),
            )
            .filter(CoinPriceHistory.timestamp >= time_limit)
            .order_by(CoinPriceHistory.timestamp.asc())  # Ensure chronological order
            .limit(100)  # Adjust limit for performance
            .all()
        )

        # Convert query result to JSON
        price_trend = [
            {
                "time": p.timestamp.isoformat(),  # Ensure correct JSON format
                "buy": p.buy_price,
                "sell": p.sell_price,
            }
            for p in price_data
        ]

        return jsonify({"price_trend": price_trend}), 200

    # Get user activity
    @staticmethod
    @token_required
    def get_user_activity(current_user):
        user_id = current_user.id

        transactions = Transaction.query.filter_by(user_id=user_id).all()
        pdes_transactions = PdesTransaction.query.filter_by(user_id=user_id).all()

        transaction_data = [transaction.serialize() for transaction in transactions]
        pdes_transaction_data = [
            pdes_transaction.serialize() for pdes_transaction in pdes_transactions
        ]

        return (
            jsonify(
                {
                    "transactions": transaction_data,
                    "pdes_transactions": pdes_transaction_data,
                }
            ),
            200,
        )
