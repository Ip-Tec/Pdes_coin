import jwt
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
)
from flask import request, jsonify
from app.key_gen import generate_key
from app.services import token_required
from app.utils import validate_required_param


class UserTransactionsController:
    """
    Controller for user transactions
    """

    # Get user transactions history
    @staticmethod
    # @token_required
    def get_transactions(current_user):
        if not current_user:
            return jsonify({"message": "User not authenticated!"}), 401

        transactions = Transaction.query.filter_by(user_id=current_user.id).all()
        transaction_data = [transaction.serialize() for transaction in transactions]
        print({"history": transactions})

        return jsonify({"transactions": transaction_data}), 200

    # Get user transactions history by id
    @staticmethod
    @token_required
    def get_transaction(id):
        user_id = request.user_id
        transaction = Transaction.query.filter_by(user_id=user_id, id=id).first()
        return jsonify({"message": transaction.serialize()}), 200

    # Add user transactions
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

    # Update user transactions
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

    # Delete user transactions
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

    # Add money to wallet and update balance
    @staticmethod
    @token_required
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

        # Update balance
        balance = Balance.query.filter_by(user_id=user_id).first()
        balance.balance += data["amount"]
        db.session.commit()

        return jsonify({"message": transaction.serialize()}), 201

    # Withdraw money from wallet and update balance
    @staticmethod
    @token_required
    def withdraw_money(user):
        user_id = user.id
        data = request.get_json()
        print (f"withdraw Trans:::: {data}")

        # Check if balance is sufficient
        balance = Balance.query.filter_by(user_id=user_id).first()
        if balance.balance < data["amount"]:
            return jsonify({"error": "Insufficient balance"}), 400
         

        transaction = Transaction(
            user_id=user_id,
            amount=-data["amount"],
            account_name=data["accountName"],
            btc_address = data["btcAddress"],
            account_number= data["accountNumber"],
            transaction_type="withdraw",
        )
        db.session.add(transaction)
        db.session.commit()

        # Update balance
        balance.balance -= data["amount"]
        db.session.commit()

        return jsonify({"message": "Withdraw in Progress", "data": transaction.serialize()}), 201

    # Buy PDES coin
    @staticmethod
    @token_required
    def buy_pdes():
        user_id = request.user_id
        data = request.get_json()

        # Ensure user has sufficient balance
        balance = Balance.query.filter_by(user_id=user_id).first()
        if balance.balance < data["amount"]:
            return jsonify({"error": "Insufficient balance"}), 400

        total_cost = data["amount"] * data["price"]

        # Deduct balance
        balance.balance -= total_cost
        db.session.commit()

        # Create buy transaction for PDES coin
        pdes_transaction = PdesTransaction(
            user_id=user_id,
            action="buy",
            amount=data["amount"],
            price=data["price"],
            total=total_cost,
        )
        db.session.add(pdes_transaction)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "PDES coins purchased successfully",
                    "transaction": pdes_transaction.serialize(),
                }
            ),
            201,
        )

    # Sell PDES coin
    @staticmethod
    @token_required
    def sell_pdes():
        user_id = request.user_id
        data = request.get_json()

        # Retrieve user's PDES crypto balance
        crypto_balance = Crypto.query.filter_by(
            user_id=user_id, crypto_name="PDES"
        ).first()
        if not crypto_balance or crypto_balance.amount < data["amount"]:
            return jsonify({"error": "Insufficient PDES coin balance"}), 400

        total_income = data["amount"] * data["price"]

        # Deduct PDES coin
        crypto_balance.amount -= data["amount"]
        db.session.commit()

        # Create sell transaction for PDES coin
        pdes_transaction = PdesTransaction(
            user_id=user_id,
            action="sell",
            amount=data["amount"],
            price=data["price"],
            total=total_income,
        )
        db.session.add(pdes_transaction)
        db.session.commit()

        # Update user balance with the income from selling
        balance = Balance.query.filter_by(user_id=user_id).first()
        balance.balance += total_income
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "PDES coins sold successfully",
                    "transaction": pdes_transaction.serialize(),
                }
            ),
            201,
        )

    # Get PDES coin price history
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

    # Get user activity (transactions)
    @staticmethod
    @token_required
    def get_user_activity(current_user):
        user_id = current_user.id

        # Get all transactions for the user
        transactions = Transaction.query.filter_by(user_id=user_id).all()
        pdes_transactions = PdesTransaction.query.filter_by(user_id=user_id).all()

        # Combine all transactions
        transaction_data = [transaction.serialize() for transaction in transactions]
        pdes_transaction_data = [
            pdes_transaction.serialize() for pdes_transaction in pdes_transactions
        ]

        print({transaction_data, pdes_transaction_data})

        return (
            jsonify(
                {
                    "transactions": transaction_data,
                    "pdes_transactions": pdes_transaction_data,
                }
            ),
            200,
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


# Get Account Details for money and Crypto
@staticmethod
@token_required
def get_account_details(user_details):
    user = user_details
    print(f"user: {user}")

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Fetch the user Account from the Account details table
    account_details = AccountDetail.query.filter_by(user_id=user.id).first()

    if not account_details:
        return jsonify({"message": "Account details not found"}), 404

    # Construct the response with current data
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
