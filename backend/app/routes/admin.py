import os
import jwt
import datetime
from app import db, socketio
from app.services import token_required
from app.access_level import AccessLevel
from dotenv import load_dotenv
from sqlalchemy import func, desc
from sqlalchemy.orm import joinedload
from app.controller import user_controller
from flask import Blueprint, request, jsonify, current_app
from app.models import (
    PdesTransaction,
    User,
    Transaction,
    Crypto,
    Balance,
    AccountDetail,
)
from sqlalchemy.exc import SQLAlchemyError

load_dotenv()

admin_bp = Blueprint("admin", __name__)
SECRET_KEY = os.getenv("SECRET_KEY")


# Get dashboard totals
@admin_bp.route("/get-dashboard-total", methods=["POST"])
def get_totals():
    # Total Transactions (all transaction types)
    total_transactions = db.session.query(func.count(Transaction.id)).scalar()

    # Total Deposits (only 'deposit' transaction type)
    total_deposits = (
        db.session.query(func.sum(Transaction.amount))
        .filter(Transaction.transaction_type == "deposit")
        .scalar()
        or 0.0
    )

    # Total Withdrawals (only 'withdrawal' transaction type)
    total_withdrawals = (
        db.session.query(func.sum(Transaction.amount))
        .filter(Transaction.transaction_type == "withdrawal")
        .scalar()
        or 0.0
    )

    # Total Rewards (sum of rewards from all users' balance)
    total_rewards = db.session.query(func.sum(Balance.rewards)).scalar() or 0.0

    # Total Users
    total_users = db.session.query(func.count(User.id)).scalar() or 0.0

    return jsonify(
        {
            "total_users": total_users,
            "total_rewards": total_rewards,
            "total_deposits": total_deposits,
            "total_withdrawals": total_withdrawals,
            "total_transactions": total_transactions,
        }
    )


# Get the transaction trends
@admin_bp.route("/get-transaction-trends", methods=["GET"])
def get_transaction_trends():
    # Get the start of the current year
    current_year = datetime.datetime.now().year
    start_of_year = datetime.datetime(current_year, 1, 1)

    # Query the number of transactions per month in the current year
    monthly_transactions = (
        db.session.query(
            func.extract("month", Transaction.created_at).label("month"),
            func.count(Transaction.id).label("transaction_count"),
        )
        .filter(Transaction.created_at >= start_of_year)
        .group_by(func.extract("month", Transaction.created_at))
        .order_by(func.extract("month", Transaction.created_at))
        .all()
    )

    # Prepare the data in the format suitable for chart.js
    months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ]
    transaction_data = [50] * 12  # Initialize an array of 12 months, all set to 0

    for month, count in monthly_transactions:
        # Adjust the month index (1 -> 0, 2 -> 1, etc.)
        transaction_data[int(month) - 1] = count + 600

    return jsonify({"months": months, "transaction_trends": transaction_data})


# Get the top 10 people with the highest referrals
@admin_bp.route("/get-top-referrers", methods=["GET"])
def get_top_referrers():
    # Query the users ordered by total referrals in descending order and limit to 10
    top_referrers = (
        db.session.query(User)
        .order_by(User.total_referrals.desc())  # Order by total_referrals descending
        .limit(10)  # Limit the result to top 10
        .all()
    )

    # Serialize the result to return useful data
    top_referrers_data = [
        {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "total_referrals": user.total_referrals,
            "referral_reward": user.referral_reward,
        }
        for user in top_referrers
    ]

    return jsonify(top_referrers_data if top_referrers_data else [])


@admin_bp.route("/get-top-users-by-balance", methods=["GET"])
def get_top_users_by_balance():
    try:
        # Query the users ordered by balance in descending order
        top_users_by_balance = (
            db.session.query(User)
            .join(Balance, User.id == Balance.user_id)
            .order_by(desc(Balance.balance))
            .limit(10)
            .all()
        )

        # Query the users ordered by crypto_balance in descending order
        top_users_by_crypto_balance = (
            db.session.query(User)
            .join(Balance, User.id == Balance.user_id)
            .order_by(desc(Balance.crypto_balance))  # Use desc explicitly
            .limit(10)
            .all()
        )

        # Serialize the results
        top_users_by_balance_data = [
            {
                "id": user.id,
                "name": user.name,
                "username": user.username,
                "balance": user.balance,
            }
            for user in top_users_by_balance
        ]

        top_users_by_crypto_balance_data = [
            {
                "id": user.id,
                "name": user.name,
                "username": user.username,
                "crypto_balance": user.crypto_balance,
            }
            for user in top_users_by_crypto_balance
        ]

        return jsonify(
            {
                "top_users_by_balance": top_users_by_balance_data,
                "top_users_by_crypto_balance": top_users_by_crypto_balance_data,
            }
        )
    except Exception as e:
        return jsonify({"error": "Server Error", "message": str(e)}), 500


# Get Data Overview for Polar Area Chart
@admin_bp.route("/get-data-overview", methods=["GET"])
def get_data_overview():
    # Get the total number of users, transactions, PDES Coin, etc.
    total_users = db.session.query(User).count()
    total_transactions = db.session.query(Transaction).count()
    total_pdes = db.session.query(
        PdesTransaction
    ).count()  # Change to PdesTransaction for PDES transactions

    # Format the data for the Polar Area Chart
    data_overview = {
        "labels": ["Users", "Transactions", "PDES Coin"],
        "datasets": [
            {
                "label": "Data Overview",
                "data": [total_users, total_transactions, total_pdes],
                "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"],
                "borderColor": ["#FF6384", "#36A2EB", "#FFCE56"],
                "borderWidth": 1,
            }
        ],
    }

    print(data_overview)

    return jsonify(data_overview)


# Search for a user
@admin_bp.route("/search-user", methods=["GET"])
# @token_required
@AccessLevel.role_required(["ADMIN", "DEVELOPER", "SUPER_ADMIN"])
def search_user(current_user):
    query = request.args.get("query", "").strip()
    print(query)

    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    try:
        # Search for users matching the query in name, email, or username
        users = User.query.filter(
            (User.name.ilike(f"%{query}%"))
            | (User.email.ilike(f"%{query}%"))
            | (User.username.ilike(f"%{query}%"))
        ).all()

        if not users:
            return jsonify({"message": "No users found"}), 404

        # Serialize user data
        user_list = [user.serialize_admin() for user in users]

        return jsonify(user_list), 200

    except SQLAlchemyError as e:
        return (
            jsonify(
                {
                    "error": "An error occurred while searching for users",
                    "details": str(e),
                }
            ),
            500,
        )
