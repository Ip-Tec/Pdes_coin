from app import db, socketio
from app.services import token_required
from app.models import Balance, CoinPriceHistory
from flask import Blueprint, request, jsonify
from app.controller.user_transactions import (
    AccountService,
    PdesService,
    UserTransactionsController,
    get_pdes_coin_details,
)

from flask_socketio import SocketIO, emit

# Transactions API
txn_bp = Blueprint("transactions", __name__)


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


# Transaction History router
@socketio.on("get_transaction_history")
@txn_bp.route("/all_transactions", methods=["GET"])
def get_transaction_history():
    transactions = UserTransactionsController.get_all_transactions()
    emit("transaction_history", {"transactions": transactions})
    return jsonify({"message": "Transaction history fetched successfully"}), 200


@txn_bp.route("/history", methods=["GET"])
def transaction_history():
    # Pass the current_user to the controller
    transactions = UserTransactionsController.get_transactions()
    return transactions


# Transaction Deposit router
# @txn_bp.route("/deposit", methods=["POST"])
# @token_required
# def deposit_funds(current_user):
#     data = request.get_json()
#     # Call the controller method to add money to the wallet
#     return UserTransactionsController.add_money(current_user)


# Deposit for user


@txn_bp.route("/naira-deposit", methods=["POST"])
@token_required
def deposit_funds(current_user):
    data = request.get_json()
    # Call the controller method to add money to the wallet
    return UserTransactionsController.user_add_deposit(current_user)


# Transaction Withdrawal router
@txn_bp.route("/withdraw", methods=["POST"])
@token_required
def withdraw_funds(current_user):
    return UserTransactionsController.withdraw_money()


# Get account balance router
@txn_bp.route("/balance", methods=["GET"])
@token_required
def get_account_balance(current_user):
    # Fetch and return the account balance from the Balance table for the current_user
    balance = Balance.query.filter_by(user_id=current_user.id).first()
    return jsonify({"balance": balance.balance if balance else 0})


# Buy/Sell PDES coin router
@txn_bp.route("/buy_sell", methods=["POST"])
@token_required
def buy_sell(current_user):
    data = request.get_json()

    action = data["action"]  # 'buy' or 'sell'
    amount = data["amount"]
    price = data["price"]  # Current price of PDES coin
    total = amount * price

    # Validate price (you can fetch this from an external API or use static)
    current_price = 50  # Example static price, replace with dynamic price if needed
    if price != current_price:
        return (
            jsonify(
                {
                    "error": "INVALID_PRICE",
                    "message": "Price doesn't match the current market price",
                }
            ),
            400,
        )

    # Call the controller method for buying or selling PDES coins
    if action == "buy":
        return PdesService.buy_pdes()
    elif action == "sell":
        return PdesService.sell_pdes()

    return (
        jsonify(
            {
                "error": "INVALID_ACTION",
                "message": "Invalid action for buying/selling PDES coin",
            }
        ),
        400,
    )


# Update price history router
@txn_bp.route("/update_price_history", methods=["POST"])
@token_required
def update_price_history(current_user):
    data = request.get_json()

    # Insert coin price history into CoinPriceHistory table
    price_history = CoinPriceHistory(
        open_price=data["open_price"],
        high_price=data["high_price"],
        low_price=data["low_price"],
        close_price=data["close_price"],
        volume=data["volume"],
    )
    db.session.add(price_history)
    db.session.commit()

    return jsonify({"message": "Price history updated successfully"})


# Fetch the current price of Pdes coin
@txn_bp.route("/get_current_price", methods=["GET"])
def get_current_price():
    # Fetch the latest price history entry
    latest_price_history = CoinPriceHistory.query.order_by(
        CoinPriceHistory.timestamp.desc()
    ).first()

    if latest_price_history:
        return jsonify({"current_price": latest_price_history.close_price})
    else:
        return jsonify({"message": "No price history available"}), 404


# Fetch the current price of Pdes coin
@txn_bp.route("/get_user_activity", methods=["GET"])
def get_user_activity():
    # Fetch the latest price history entry
    activity = UserTransactionsController.get_user_activity()

    print(f"Activity Trans::::{activity}")

    if activity:
        return jsonify({"user_activity": activity})
    else:
        return jsonify({"message": "Could't get User Activity"}), 404


@txn_bp.route("/pdes-details", methods=["GET"])
def fetch_pdes_details():
    details = get_pdes_coin_details()
    return jsonify(details)


# Get the conversion rate
@txn_bp.route("/conversion-rate", methods=["GET"])
def get_conversion_rate():
    rate = get_pdes_coin_details()
    print(f"conversion_rate: {rate}")

    if rate:
        return jsonify({"conversion_rate": rate})

    return jsonify({"message": "Conversion rate not found"}), 404


# Get Account details for flart and crypto
@txn_bp.route("/get-account-details", methods=["GET"])
def get_account_details():
    # Fetch the latest Utility data
    return AccountService.get_account_details()


# PDES Chart router
@txn_bp.route("/price-history", methods=["GET"])
@token_required
def get_price_history(current_user):
    return PdesService.get_pdes_price_history()


# get account detail for user to deposit to
@txn_bp.route("/random_deposit_account", methods=["GET"])
@token_required
def get_random_deposit_account(current_user):
    data = AccountService.get_random_deposit_account()
    print(f"random_deposit_account: {data}")
    return data
