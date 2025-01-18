from io import StringIO
import os
import csv
import jwt
import datetime
from app import db, socketio
from app.services import token_required
from app.access_level import AccessLevel
from dotenv import load_dotenv
from sqlalchemy import func, desc
from sqlalchemy.orm import joinedload
from app.controller import user_controller
from flask import Blueprint, request, jsonify, Response
from app.models import (
    DepositAccount,
    PdesTransaction,
    RewardConfig,
    User,
    Transaction,
    Crypto,
    Balance,
    AccountDetail,
    Utility,
)
from sqlalchemy.exc import IntegrityError
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


# Add a deposit account
@admin_bp.route("/add-account", methods=["POST"])
@token_required
@AccessLevel.role_required(["ADMIN", "DEVELOPER", "SUPER_ADMIN"])
def add_account(current_user, *args, **kwargs):
    """
    Admin route to add a deposit account.
    Expects JSON input:
    {
        "account_name": str,
        "account_number": str,
        "account_type": str,  # optional, defaults to "savings"
        "max_deposit_amount": float  # optional, defaults to 98999.00
    }
    """
    data = request.get_json()

    # Validate required fields
    required_fields = [
        "bank_name",
        "account_name",
        "account_number",
        "account_type",
        "max_deposit_amount",
    ]
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return (
            jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}),
            400,
        )

    try:
        # Extract data and set defaults
        user_id = current_user.id
        bank_name = data.get("bank_name", "Opay")
        account_name = data["account_name"]
        account_number = data["account_number"]
        account_type = data.get("account_type", "savings")  # Default to "savings"
        max_deposit_amount = data.get(
            "max_deposit_amount", 98999.00
        )  # Default to 98999.00

        # Create a new DepositAccount instance
        new_account = DepositAccount(
            user_id=user_id,
            bank_name=bank_name,
            account_name=account_name,
            account_number=account_number,
            account_type=account_type,
            max_deposit_amount=max_deposit_amount,
        )

        # Add the new account to the database
        db.session.add(new_account)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Account added successfully"
                    # , "account": new_account.serialize()
                }
            ),
            201,
        )

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Account number must be unique"}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# Confirm user deposit and add it to Transaction, Balance, and Crypto tables
@admin_bp.route("/add-money", methods=["POST"])
@staticmethod
@token_required
@AccessLevel.role_required(["ADMIN", "DEVELOPER", "SUPER_ADMIN"])
def add_money(current_user, *args, **kwargs):
    # Get the user_id from the request data (admin confirms the deposit for a specific user)
    data = request.get_json()
    user_id = data.get("id")  # Ensure the admin sends the user_id in the requestprint
    
    print(f"User_ID: {current_user}")

    # Ensure the user_id is provided
    if not user_id:
        return jsonify({"message": "User ID is required"}), 400

    # Add deposit transaction to the Transaction table
    transaction = Transaction(
        user_id=user_id,
        amount=data["amount"],
        account_name=data["account_name"],
        btc_address = data["btc_address"],
        account_number=data["account_number"],
        transaction_type=data["transaction_type"],
        transaction_completed = True,
        confirm_by = current_user.id
    )
    db.session.add(transaction)
    db.session.commit()

    # Update the user's balance in the Balance table
    balance = Balance.query.filter_by(user_id=user_id).first()
    if not balance:
        return jsonify({"message": "Balance record not found for user"}), 404
    balance.balance += data["amount"]
    db.session.commit()

    # Update the user's crypto balance if applicable (for example, depositing in Pdes)
    crypto = Crypto.query.filter_by(user_id=user_id, crypto_name="Pdes").first()
    if not crypto:
        # If no record for Pdes, create it
        crypto = Crypto(
            user_id=user_id,
            crypto_name="Pdes",
            amount=0.0,  # No amount initially
            account_address="",  # Assuming no address is needed
        )
        db.session.add(crypto)

    # If the deposit involves adding to crypto, adjust accordingly (assuming deposit amount is in crypto)
    if data["transaction_type"] == "deposit":
        crypto.amount += data["amount"]

    db.session.commit()

    # Optionally, add any rewards for the deposit
    reward_config = RewardConfig.query.first()  # Assuming a global reward config
    if reward_config:
        reward_amount = data["amount"] * (reward_config.percentage_weekly / 100)
        # Add the reward to the balance
        balance.rewards += reward_amount

        # Create a reward transaction
        reward_transaction = Transaction(
            user_id=user_id,
            amount=reward_amount,
            account_name="Reward",
            account_number="",
            transaction_type="reward",
        )
        db.session.add(reward_transaction)
        db.session.commit()

    return jsonify({"transaction": transaction.serialize()}), 201


# Downloading Transaction CSV
@admin_bp.route("/download-transaction-csv", methods=["GET"])
@staticmethod
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN"])
def download_transaction_csv():
    transactions = Transaction.query.all()  # Fetch all transactions

    # Generate the CSV response
    def generate():
        fieldnames = [
            "User ID",
            "Amount",
            "Account Name",
            "Account Number",
            "Transaction Type",
            "Date",
        ]
        writer = csv.DictWriter(Response(), fieldnames=fieldnames)
        writer.writeheader()
        for transaction in transactions:
            yield writer.writerow(
                {
                    "User ID": transaction.user_id,
                    "Amount": transaction.amount,
                    "Account Name": transaction.account_name,
                    "Account Number": transaction.account_number,
                    "Transaction Type": transaction.transaction_type,
                    "Date": transaction.timestamp,
                }
            )

    return Response(
        generate(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"},
    )


# Uploading Transaction CSV
@admin_bp.route("/upload-transaction-csv", methods=["POST"])
@staticmethod
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
def upload_transaction_csv():
    file = request.files.get("file")
    if not file:
        return jsonify({"message": "No file uploaded"}), 400

    try:
        # Read CSV file
        file_content = StringIO(file.read().decode("utf-8"))
        csv_reader = csv.DictReader(file_content)

        for row in csv_reader:
            user_id = row.get("User ID")
            amount = float(row.get("Amount"))
            account_name = row.get("Account Name")
            account_number = row.get("Account Number")
            transaction_type = row.get("Transaction Type")
            # Add transaction to the database
            transaction = Transaction(
                user_id=user_id,
                amount=amount,
                account_name=account_name,
                account_number=account_number,
                transaction_type=transaction_type,
            )
            db.session.add(transaction)

        db.session.commit()
        return jsonify({"message": "Transactions uploaded successfully!"}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# Add Utility Data
@admin_bp.route("/utility", methods=["POST"])
@staticmethod
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
def add_utility(current_user, *args, **kwargs):
    data = request.get_json()

    try:
        data = request.json
        pdes_price = data.get("pdes_price")
        pdes_circulating_supply = data.get("pdes_circulating_supply")

        if not pdes_price or not pdes_circulating_supply:
            return jsonify({"error": "Missing required fields"}), 400

        # Automatically calculate the market cap
        pdes_market_cap = float(pdes_price) * float(pdes_circulating_supply)

        utility = Utility(
            pdes_price=data["pdes_price"],
            pdes_market_cap=pdes_market_cap,
            pdes_circulating_supply=data["pdes_circulating_supply"],
            conversion_rate=data["conversion_rate"],
            reward_percentage=data["reward_percentage"],
            referral_percentage=data["referral_percentage"],
            pdes_supply_left=data["pdes_supply_left"],
            pdes_total_supply=data["pdes_total_supply"],
        )
        db.session.add(utility)
        db.session.commit()

        return jsonify({"message": "Utility data added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
