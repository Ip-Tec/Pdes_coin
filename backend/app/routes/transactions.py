
from app import db
from app.services import token_required
from app.models import Balance, CoinPriceHistory
from flask import Blueprint, request, jsonify
from app.controller.user_transactions import UserTransactionsController

# Transactions API
txn_bp = Blueprint("transactions", __name__)

# Transaction History router
@txn_bp.route("/history", methods=["GET"])
@token_required
def get_transaction_history(current_user):
    # Pass the current_user to the controller
    return UserTransactionsController.get_transactions(current_user)

# Transaction Deposit router
@txn_bp.route("/deposit", methods=["POST"])
@token_required
def deposit_funds(current_user):
    data = request.get_json()
    # Call the controller method to add money to the wallet
    return UserTransactionsController.add_money(current_user)

# Transaction Withdrawal router
@txn_bp.route("/withdraw", methods=["POST"])
@token_required
def withdraw_funds(current_user):
    data = request.get_json()
    # Call the controller method to withdraw money
    return UserTransactionsController.withdraw_money(current_user)

# Get account balance router
@txn_bp.route("/balance", methods=["GET"])
@token_required
def get_account_balance(current_user):
    # Fetch and return the account balance from the Balance table for the current_user
    balance = Balance.query.filter_by(user_id=current_user.id).first()
    return jsonify({"balance": balance.balance if balance else 0})

# Buy/Sell PDES coin router
@txn_bp.route('/buy_sell', methods=['POST'])
@token_required
def buy_sell(current_user):
    data = request.get_json()

    action = data['action']  # 'buy' or 'sell'
    amount = data['amount']
    price = data['price']  # Current price of PDES coin
    total = amount * price

    # Call the controller method for buying or selling PDES coins
    if action == "buy":
        return UserTransactionsController.buy_pdes(current_user)
    elif action == "sell":
        return UserTransactionsController.sell_pdes(current_user)

    return jsonify({"message": "Invalid action for buying/selling PDES coin"}), 400

# Update price history router
@txn_bp.route('/update_price_history', methods=['POST'])
@token_required
def update_price_history(current_user):
    data = request.get_json()

    # Insert coin price history into CoinPriceHistory table
    price_history = CoinPriceHistory(
        open_price=data['open_price'],
        high_price=data['high_price'],
        low_price=data['low_price'],
        close_price=data['close_price'],
        volume=data['volume']
    )
    db.session.add(price_history)
    db.session.commit()

    return jsonify({"message": "Price history updated successfully"})

# Fetch the current price of Pdes coin
@txn_bp.route('/get_current_price', methods=['GET'])
def get_current_price():
    # Fetch the latest price history entry
    latest_price_history = CoinPriceHistory.query.order_by(CoinPriceHistory.timestamp.desc()).first()

    if latest_price_history:
        return jsonify({"current_price": latest_price_history.close_price})
    else:
        return jsonify({"message": "No price history available"}), 404

# Fetch the current price of Pdes coin
@txn_bp.route('/get_user_activity', methods=['GET'])
def get_user_activity():
    # Fetch the latest price history entry
    activity = UserTransactionsController.get_user_activity()
    
    print(f"{activity}")

    if activity:
        return jsonify({"user_activity": activity})
    else:
        return jsonify({"message": "Could't get User Activity"}), 404