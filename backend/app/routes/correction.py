from flask import Blueprint, request, jsonify
from app.controller.correction_controller import (
    check_balance_discrepancy,
    handle_balance_issue,
    update_correct_balance,
)

correct_bp = Blueprint("correct", __name__)


@correct_bp.route("/update_correct_balance/<int:user_id>", methods=["POST"])
def update_correct_balance_route(user_id):
    data = request.json  # Assumes you send {"correct_balance": 100.0}
    new_correct_balance = data.get("correct_balance")
    if new_correct_balance is None:
        return jsonify({"error": "Correct balance not provided"}), 400

    result = update_correct_balance(user_id, new_correct_balance)
    return jsonify(result)


@correct_bp.route("/check_balance/<int:user_id>", methods=["GET"])
def check_balance_route(user_id):
    result = check_balance_discrepancy(user_id)
    return jsonify(result)


@correct_bp.route("/handle_balance_issue/<int:user_id>", methods=["POST"])
def handle_balance_issue_route(user_id):
    data = request.json
    new_correct_balance = data.get("correct_balance")
    if new_correct_balance is None:
        return jsonify({"error": "Correct balance not provided"}), 400

    result = handle_balance_issue(user_id, new_correct_balance)
    return jsonify(result)
