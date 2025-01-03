from app.services import token_required
from flask import Blueprint, request, jsonify
from app.controller.user_transactions import UserTransactionsController
 
# Transactions API
txn_bp = Blueprint("transactions", __name__)
 
# Transaction History router

@txn_bp.route("/history", methods=["GET"])
def get_transaction_history():
    # Pass the current_user to the controller
    return UserTransactionsController.get_transactions()

# Transaction Deposit router
@txn_bp.route("/deposit", methods=["POST"])
def deposit_funds():
    # Implement logic to deposit funds
    # For now, let's return a dummy response
    return jsonify({"message": "Deposit funds endpoint"})

# Transaction Withdrawal router
@txn_bp.route("/withdraw", methods=["POST"])
def withdraw_funds():
    # Implement logic to withdraw funds
    # For now, let's return a dummy response
    return jsonify({"message": "Withdraw funds endpoint"})

# Transaction Transfer router
@txn_bp.route("/transfer", methods=["POST"])
def transfer_funds():
    # Implement logic to transfer funds
    # For now, let's return a dummy response
    return jsonify({"message": "Transfer funds endpoint"})

# Transaction Request router
@txn_bp.route("/request", methods=["POST"])
def request_funds():
    # Implement logic to request funds
    # For now, let's return a dummy response
    return jsonify({"message": "Request funds endpoint"})

# get ancount balance
@txn_bp.route("/balance", methods=["GET"])
def get_account_balance():
    # Implement logic to get account balance
    get_transactions = UserTransactionsController.get_transactions()
    return get_transactions