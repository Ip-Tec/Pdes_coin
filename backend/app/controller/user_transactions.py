import jwt
import logging
import traceback
import datetime
from app import db
from app.models import (
    AccountDetail,
    User,
    Transaction,
    Crypto,
    Balance,
    PdesTransaction,
    CoinPriceHistory,
    Utility,
    PdesTransaction,
)
from app.access_level import AccessLevel
from flask import request, jsonify
from app.key_gen import generate_key
from app.services import token_required
from app.utils import validate_required_param
from sqlalchemy.exc import SQLAlchemyError


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
        print(f"transaction_data::: {transaction_data}")
        return jsonify({"transactions": transaction_data}), 200

    @staticmethod
    @token_required
    def get_transaction(id):
        user_id = request.user_id
        transaction = Transaction.query.filter_by(user_id=user_id, id=id).first()
        return jsonify({"message": transaction.serialize()}), 200

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
    @AccessLevel.role_required(["ADMIN", "DEVELOPER", "SUPER_ADMIN"])
    def add_money():
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

        balance = Balance.query.filter_by(user_id=user_id).first()
        balance.balance += data["amount"]
        db.session.commit()

        return jsonify({"message": transaction.serialize()}), 201

    @staticmethod
    @token_required
    def withdraw_money(user):
        user_id = user.id
        data = request.get_json()

        required_fields = {
            "Amount": "amount",
            "Account Name": "accountName",
            "Account Type": "accountType",
        }
        for field, field_name in required_fields.items():
            if field_name not in data or not data[field_name]:
                return jsonify({"error": f"'{field_name}' field is required."}), 400

        if not data.get("accountNumber") and not data.get("btcAddress"):
            return (
                jsonify({"error": "Provide either 'accountNumber' or 'btcAddress'."}),
                400,
            )

        if data.get("accountNumber") and data.get("btcAddress"):
            return (
                jsonify(
                    {
                        "error": "Provide either 'accountNumber' or 'btcAddress', not both."
                    }
                ),
                400,
            )

        try:
            data["amount"] = float(data["amount"])
        except (ValueError, TypeError):
            return jsonify({"error": "'amount' must be a number"}), 400

        balance = Balance.query.filter_by(user_id=user_id).first()
        if not balance:
            return jsonify({"error": "Balance record not found."}), 400
        if balance.balance < data["amount"]:
            return jsonify({"error": "Insufficient balance."}), 400

        try:
            transaction = Transaction(
                user_id=user_id,
                amount=-data["amount"],
                account_name=data["accountName"],
                btc_address=data.get("btcAddress"),
                account_number=data.get("accountNumber"),
                transaction_type=f"withdraw + {data['accountType']}",
            )
            db.session.add(transaction)
            balance.balance -= data["amount"]
            db.session.commit()

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
            "pdes_price": utility.pdes_price,
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


# Setting up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PdesService:
    # Buy PDES coin
    @staticmethod
    @token_required
    def buy_pdes():
        user_id = request.user_id
        data = request.get_json()

        # Validate required fields
        required_fields = ["amount", "price"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field} is required"}), 400

        amount = data["amount"]
        price = data["price"]

        # Validate amount and price
        if amount <= 0 or price <= 0:
            return jsonify({"error": "Amount and price must be positive numbers"}), 400

        try:
            # Fetch user's balance
            balance = Balance.query.filter_by(user_id=user_id).first()
            if not balance:
                return jsonify({"error": "User balance not found"}), 404

            total_cost = amount * price

            # Ensure sufficient balance
            if balance.balance < total_cost:
                return (
                    jsonify(
                        {
                            "error": "INSUFFICIENT_BALANCE",
                            "message": "Insufficient balance",
                        }
                    ),
                    400,
                )

            # Deduct balance
            balance.balance -= total_cost

            # Create buy transaction
            pdes_transaction = PdesTransaction(
                user_id=user_id,
                action="buy",
                amount=amount,
                price=price,
                total=total_cost,
            )
            db.session.add(pdes_transaction)
            db.session.commit()

            logger.info(f"User {user_id} bought {amount} PDES at {price} per coin")

            # Send transaction summary including remaining balance
            return (
                jsonify(
                    {
                        "status": "success",
                        "message": "PDES coins purchased successfully",
                        "transaction": pdes_transaction.serialize(),
                        "balance": {
                            "remaining_balance": balance.balance,
                            "crypto_balance": 0,  # If you're tracking crypto balance, replace 0 with actual value
                        },
                    }
                ),
                201,
            )
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Error during buy transaction: {str(e)}")
            return (
                jsonify({"error": "Transaction failed", "code": "TRANSACTION_FAILED"}),
                500,
            )

    # Sell PDES coin
    @staticmethod
    @token_required
    def sell_pdes():
        user_id = request.user_id
        data = request.get_json()

        # Validate required fields
        required_fields = ["amount", "price"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field} is required"}), 400

        amount = data["amount"]
        price = data["price"]

        # Validate amount and price
        if amount <= 0 or price <= 0:
            return jsonify({"error": "Amount and price must be positive numbers"}), 400

        try:
            # Fetch user's PDES crypto balance
            crypto_balance = Crypto.query.filter_by(
                user_id=user_id, crypto_name="PDES"
            ).first()
            if not crypto_balance or crypto_balance.amount < amount:
                return (
                    jsonify(
                        {
                            "error": "INSUFFICIENT_PDES_BALANCE",
                            "message": "Insufficient PDES coin balance",
                        }
                    ),
                    400,
                )

            total_income = amount * price

            # Deduct PDES coins
            crypto_balance.amount -= amount

            # Create sell transaction
            pdes_transaction = PdesTransaction(
                user_id=user_id,
                action="sell",
                amount=amount,
                price=price,
                total=total_income,
            )
            db.session.add(pdes_transaction)

            # Update user's balance
            balance = Balance.query.filter_by(user_id=user_id).first()
            if not balance:
                return jsonify({"error": "User balance not found"}), 404
            balance.balance += total_income

            db.session.commit()

            logger.info(f"User {user_id} sold {amount} PDES at {price} per coin")

            # Send transaction summary including remaining balance
            return (
                jsonify(
                    {
                        "status": "success",
                        "message": "PDES coins sold successfully",
                        "transaction": pdes_transaction.serialize(),
                        "balance": {
                            "remaining_balance": balance.balance,
                            "crypto_balance": crypto_balance.amount,
                        },
                    }
                ),
                201,
            )
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Error during sell transaction: {str(e)}")
            return (
                jsonify({"error": "Transaction failed", "code": "TRANSACTION_FAILED"}),
                500,
            )

    # Get PDES price history
    @staticmethod
    @token_required
    def get_pdes_price_history():
        price_history = (
            CoinPriceHistory.query.filter_by(crypto_name="PDES")
            .order_by(CoinPriceHistory.timestamp.desc())
            .all()
        )
        price_history_data = [price.serialize() for price in price_history]
        return jsonify({"price_history": price_history_data}), 200

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
