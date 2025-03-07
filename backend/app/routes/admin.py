from io import StringIO
import os
import csv
import traceback
import jwt
import datetime
from datetime import datetime as dt
from app import db, socketio
from dotenv import load_dotenv
from sqlalchemy.orm import joinedload
from app.services import token_required
from app.access_level import AccessLevel
from sqlalchemy import func, desc, case
from app.controller import user_controller
from werkzeug.security import generate_password_hash
from flask import Blueprint, request, jsonify, Response, make_response, current_app
from app.models import (
    Deposit,
    DepositAccount,
    PdesTransaction,
    RewardConfig,
    RewardSetting,
    User,
    Transaction,
    Crypto,
    Balance,
    AccountDetail,
    Utility,
    UserRewardHistory,
) 
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

load_dotenv()

admin_bp = Blueprint("admin", __name__)
SECRET_KEY = os.getenv("SECRET_KEY")


# Get dashboard totals
@admin_bp.route("/get-dashboard-total", methods=["POST"])
@token_required
@AccessLevel.role_required(["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN", "OWNER"])
def get_dashboard_total(current_user):
    # Get the total number of transactions
    total_transactions = Transaction.query.count()
    
    # Calculate the different totals
    total_users = User.query.count()
    total_deposits = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.transaction_type == "deposit"
    ).scalar() or 0
    
    # Fix for Total Withdrawals: Ensure we're correctly filtering withdrawal transactions
    total_withdrawals = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.transaction_type.like("%withdrawal%")
    ).scalar() or 0
    
    # Calculate total rewards from user referral rewards
    total_rewards = db.session.query(func.sum(User.referral_reward)).filter(
        User.referral_reward > 0
    ).scalar() or 0
    
    # Also check user balances for rewards that might be stored there
    total_rewards_from_balances = db.session.query(func.sum(Balance.rewards)).scalar() or 0
    total_rewards += total_rewards_from_balances
    
    # Check if we have a RewardConfig and total rewards processed
    reward_config = RewardConfig.query.first()
    reward_percentage = reward_config.percentage_weekly if reward_config else 0
    
    return jsonify({
        "total_users": total_users,
        "total_deposits": float(total_deposits),
        "total_transactions": total_transactions,
        "total_withdrawals": float(total_withdrawals),
        "total_rewards": "{:.4f}".format(total_rewards),  # Format as a string with 4 decimal places
        "reward_percentage": float(reward_percentage)
    }), 200


# Get the transaction trends
@admin_bp.route("/get-transaction-trends", methods=["GET"])
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "OWNER"])
def get_transaction_trends(current_user, *args, **kwargs):
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
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "OWNER"])
def get_top_referrers(current_user, *args, **kwargs):

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
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "OWNER"])
def get_top_users_by_balance(current_user, *args, **kwargs):
    try:
        # Query the users and serialize them
        users = [user.serialize() for user in User.query.all()]
        # print(f"{users=}")  # Debugging output

        top_users_by_balance_data = []
        top_users_by_crypto_balance_data = []

        for user in users:
            balance = user.get("balance", 0.0)
            crypto_balance = user.get("crypto_balance", 0.0)

            top_users_by_balance_data.append({
                "id": user["id"], 
                "name": user["full_name"], 
                "username": user["username"], 
                "balance": balance
            })

            top_users_by_crypto_balance_data.append({
                "id": user["id"], 
                "name": user["full_name"], 
                "username": user["username"], 
                "crypto_balance": crypto_balance
            })

        # Sort both lists
        top_users_by_balance_data = sorted(top_users_by_balance_data, key=lambda x: x["balance"], reverse=True)
        top_users_by_crypto_balance_data = sorted(top_users_by_crypto_balance_data, key=lambda x: x["crypto_balance"], reverse=True)

        return jsonify({
            "top_users_by_balance": top_users_by_balance_data,
            "top_users_by_crypto_balance": top_users_by_crypto_balance_data,
        })
    except Exception as e:
        return jsonify({"error": "Server Error", "message": str(e)}), 500


# Get Data Overview for Polar Area Chart
@admin_bp.route("/get-data-overview", methods=["GET"])
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "OWNER"])
def get_data_overview(current_user, *args, **kwargs):
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
@AccessLevel.role_required(["ADMIN", "DEVELOPER", "SUPER_ADMIN", "OWNER"])
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
@AccessLevel.role_required(["ADMIN", "DEVELOPER", "SUPER_ADMIN", "OWNER"])
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


# Admin route to change user password
@admin_bp.route("/change-password", methods=["POST", "PUT"])
@token_required
@AccessLevel.role_required(
    ["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]
)
def change_password(current_user, *args, **kwargs):
    admin_id = current_user.id
    data = request.get_json()

    user_id = data.get("id")
    user_email = data.get("email")
    user_username = data.get("username")
    user_password = data.get("password")
    

    # Validate input
    if not all([user_id, user_email, user_username, user_password]):
        return jsonify({"error": "All fields are required"}), 400

    # Find user in DB
    user = User.query.filter_by(
        id=user_id, email=user_email, username=user_username
    ).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Hash new password
    user.password = generate_password_hash(user_password)

    # Save to DB
    db.session.commit()

    return jsonify({"message": "User password has been updated successfully"}), 200


# Confirm user deposit and add it to Transaction, Balance, and Crypto tables
@admin_bp.route("/add-money", methods=["POST"])
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def confirm_user_deposit(current_user, *args, **kwargs):
    try:
        # Get the user_id from the request data
        data = request.get_json()
        user_id = data.get("user_id")
        # print(f"data:: {data=}")

        # Validate user_id
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        # Ensure the user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Ensure required fields are present
        required_fields = [
            "amount",
            "account_name",
            "account_number",
            "transaction_type",
        ]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return (
                jsonify(
                    {"error": f"Missing required fields: {', '.join(missing_fields)}"}
                ),
                400,
            )

        # Validate transaction_type
        if data["transaction_type"] not in ["deposit", "withdrawal"]:
            return (
                jsonify(
                    {
                        "error": "Invalid transaction_type. Allowed values are 'deposit' or 'withdrawal'"
                    }
                ),
                400,
            )

        # Validate amounts (if provided)
        if "amount" in data:
            try:
                data["amount"] = float(data["amount"])
                if data["amount"] <= 0:
                    raise ValueError("Amount must be a positive number")
            except ValueError as e:
                return jsonify({"error": f"Invalid amount: {e}"}), 400

        if "crypto_balance" in data:
            try:
                data["crypto_balance"] = float(data["crypto_balance"])
                if data["crypto_balance"] <= 0:
                    raise ValueError("Crypto balance must be a positive number")
            except ValueError as e:
                return jsonify({"error": f"Invalid crypto_balance: {e}"}), 400

        # Prevent conflicting deposit types
        if "amount" in data and "crypto_balance" in data:
            return (
                jsonify(
                    {
                        "error": "Cannot deposit both fiat and cryptocurrency in a single transaction"
                    }
                ),
                400,
            )

        # Changet the Deposit status to completed
        deposit = Deposit.query.filter_by(
            id=data["id"],
            user_id=user_id,
            session_id=data["session_id"],
            transaction_id=data["transaction_id"],
        ).first()

        if deposit:
            if deposit.status == "completed":
                return jsonify({"error": "Deposit already confirmed"}), 400

            deposit.status = "completed"
            deposit.updated_at = db.func.current_timestamp()
            db.session.add(deposit)

        # Fetch conversion rate and convert fiat to dollars
        conversion_rate_entry = Utility.query.first()
        if not conversion_rate_entry:
            return jsonify({"error": "Conversion rate not found in Utility table"}), 500

        conversion_rate = float(conversion_rate_entry.conversion_rate)
        amount_in_dollars = data["amount"] / conversion_rate
        # print(f"Converted amount: {amount_in_dollars} USD")

        # Add deposit transaction to the Transaction table
        transaction = Transaction(
            user_id=user_id,
            confirm_by=current_user.id,
            transaction_completed=True,
            account_name=data["account_name"],
            account_number=data["account_number"],
            crypto_address=data.get("crypto_address", ""),
            transaction_type=data["transaction_type"],
            amount=amount_in_dollars,
            currency=data.get("currency", "naira"),
        )
        db.session.add(transaction)

        # Handle fiat deposit
        if "amount" in data:
            balance = Balance.query.filter_by(user_id=user_id).first()
            if not balance:
                balance = Balance(
                    user_id=user_id,
                    balance=amount_in_dollars,
                    crypto_balance=0.0,
                    rewards=0.0,
                )
                db.session.add(balance)
            else:
                balance.balance += amount_in_dollars

        # Handle crypto deposit
        elif "crypto_balance" in data:
            crypto = Crypto.query.filter_by(user_id=user_id, crypto_name="Pdes").first()
            if not crypto:
                crypto = Crypto(
                    user_id=user_id,
                    crypto_name="Pdes",
                    amount=0.0,
                    account_address="",
                )
                db.session.add(crypto)

            crypto.amount += data["crypto_balance"]

        # Commit all changes
        db.session.commit()
        
        # Give the referrer rewards
        if user.referrer_id:
            referrer = User.query.get(user.referrer_id)
            if referrer:
                # Get the referrer's percentage from Utility table
                utility = Utility.query.first()
                referrer_percentage = utility.referral_percentage

                # Calculate the reward
                reward = amount_in_dollars * referrer_percentage

                # Update the referrer's reward
                referrer.referral_reward += reward

                # Optionally, update the referrer's balance if needed
                # referrer_balance = Balance.query.filter_by(user_id=referrer.id).first()
                # if referrer_balance:
                #     referrer_balance.balance += reward

                db.session.commit()

        # Return the created transaction as a response
        return (
            jsonify(
                {
                    # "transaction": transaction.serialize(),
                    "message": "Transaction confirmed successfully!",
                }
            ),
            201,
        )

    except IntegrityError as e:
        db.session.rollback()
        return (
            jsonify({"error": "Database integrity error", "details": str(e.orig)}),
            400,
        )
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "An unexpected error occurred", "details": str(e)}),
            500,
        )


# Downloading Transaction CSV
@admin_bp.route("/download-transaction-csv", methods=["GET"])
@staticmethod
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
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
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
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
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def add_utility(current_user, *args, **kwargs):
    data = request.get_json()

    try:
        data = request.json
        pdes_buy_price = data.get("pdes_buy_price")
        pdes_sell_price = data.get("pdes_sell_price")
        pdes_circulating_supply = data.get("pdes_circulating_supply")

        if not pdes_buy_price or not pdes_sell_price or not pdes_circulating_supply:
            return jsonify({"error": "Missing required fields"}), 400

        # Automatically calculate the market cap
        pdes_market_cap = float(pdes_buy_price) * float(pdes_circulating_supply)

        utility = Utility(
            pdes_buy_price=data["pdes_buy_price"],
            pdes_sell_price=data["pdes_sell_price"],
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


# Search the Deposit table
@admin_bp.route("/search-deposits", methods=["GET"])
@token_required
@AccessLevel.role_required(
    ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER", "MODERATOR", "SUPPORT"]
)
def search_deposits(current_user, *args, **kwargs):
    try:
        # Extract query parameters
        query = request.args.get("query", "").strip()
        # Build the query dynamically
        query = Deposit.query.filter(
            (Deposit.user_id.ilike(f"%{query}%"))
            | (Deposit.amount.ilike(f"%{query}%"))
            | (Deposit.status.ilike(f"%{query}%"))
            | (Deposit.currency.ilike(f"%{query}%"))
            | (Deposit.deposit_method.ilike(f"%{query}%"))
            | (Deposit.admin_id.ilike(f"%{query}%"))
        )

        if not query:
            return jsonify({"message": "No Deposit found"}), 404

        # Execute the query and serialize the results
        deposits = query.all()
        result = [deposit.serialize_with_user() for deposit in deposits]

        print(f"Result: {result}")

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# Function to get transaction proportions by type or currency
@admin_bp.route("/proportions", methods=["GET"])
@staticmethod
@token_required
@AccessLevel.role_required(
    ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER", "MODERATOR", "SUPPORT"]
)
def get_transaction_proportions(current_user, *args, **kwargs):
    type = request.args.get("type", "transaction_type").strip()

    # If 'type' is 'transaction_type', group by transaction_type
    if type == "transaction_type":
        proportions = (
            db.session.query(
                # Use a conditional case to handle the presence or absence of ' + '
                case(
                    (
                        func.instr(Transaction.transaction_type, " + ") > 0,
                        func.substr(
                            Transaction.transaction_type,
                            1,
                            func.instr(Transaction.transaction_type, " + ") - 1,
                        ),
                    ),
                    else_=Transaction.transaction_type,
                ).label("transaction_type"),
                func.sum(Transaction.amount).label("total_amount"),
            )
            .group_by(
                case(
                    (
                        func.instr(Transaction.transaction_type, " + ") > 0,
                        func.substr(
                            Transaction.transaction_type,
                            1,
                            func.instr(Transaction.transaction_type, " + ") - 1,
                        ),
                    ),
                    else_=Transaction.transaction_type,
                )
            )
            .all()
        )
        labels = [trans.transaction_type for trans in proportions]
        data = [trans.total_amount for trans in proportions]

    # If 'type' is 'currency', group by currency
    elif type == "currency":
        proportions = (
            db.session.query(
                Transaction.currency, func.sum(Transaction.amount).label("total_amount")
            )
            .group_by(Transaction.currency)
            .all()
        )
        labels = [trans.currency for trans in proportions]
        data = [trans.total_amount for trans in proportions]

    else:
        return (
            jsonify(
                {
                    "error": "Invalid type parameter, must be 'transaction_type' or 'currency'}"
                }
            ),
            400,
        )

    return jsonify(
        {
            "labels": labels,
            "data": data,
        }
    )


# Function to get transaction distribution over time (e.g., daily)
@admin_bp.route("/distribution-over-time", methods=["GET"])
@staticmethod
@token_required
@AccessLevel.role_required(
    ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER", "MODERATOR", "SUPPORT"]
)
def get_transaction_distribution_over_time(current_user, *args, **kwargs):
    # Get the start date for the last 30 days
    start_date = datetime.datetime.now() - datetime.timedelta(days=30)

    # Query the transaction amounts grouped by the date (day)
    transactions = (
        db.session.query(
            func.date(Transaction.created_at).label("date"),
            func.sum(Transaction.amount).label("total_amount"),
        )
        .filter(Transaction.created_at >= start_date)
        .group_by("date")
        .all()
    )

    # Prepare the data for the chart
    labels = [str(trans.date) for trans in transactions]
    data = [trans.total_amount for trans in transactions]

    return jsonify({"labels": labels, "data": data})


# Configure Reward Setting
@admin_bp.route("/configure-reward-setting", methods=["POST"])
@staticmethod
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def configure_reward_setting(current_user, *args, **kwargs):
    data = request.json  # Get data from the request body
    try:
        weekly_percentage = data.get("weekly_percentage")
        start_date_str = data.get("start_date")
        end_date_str = data.get("end_date")

        # Convert string dates to datetime.date
        start_date = dt.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = (
            dt.strptime(end_date_str, "%Y-%m-%d").date() if end_date_str else None
        )

        # Insert into the database
        reward_setting = RewardSetting(
            weekly_percentage=weekly_percentage,
            start_date=start_date,
            end_date=end_date,
        )
        db.session.add(reward_setting)
        db.session.commit()

        return jsonify({"message": "Reward settings configured successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Download Deposits
@admin_bp.route("/download-deposits", methods=["GET"])
@token_required
@AccessLevel.role_required(
    ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER", "MODERATOR", "SUPPORT"]
)
def download_deposits(current_user, *args, **kwargs):
    try:
        # Query all deposit transactions
        transactions = Transaction.query.filter(
            Transaction.transaction_type == "deposit"
        ).all()

        # Create a CSV file in memory
        output = StringIO()
        writer = csv.writer(output)

        # Write CSV headers
        writer.writerow(
            [
                "ID",
                "User ID",
                "Amount",
                "Currency",
                "Account Name",
                "Account Number",
                "Crypto Address",
                "Transaction Type",
                "Transaction Completed",
                "Created At",
                "Updated At",
            ]
        )

        # Write each deposit transaction to the CSV file
        for txn in transactions:
            writer.writerow(
                [
                    txn.id,
                    txn.user_id,
                    txn.amount,
                    txn.currency,
                    txn.account_name,
                    txn.account_number,
                    txn.crypto_address,
                    txn.transaction_type,
                    txn.transaction_completed,
                    txn.created_at.isoformat() if txn.created_at else "",
                    txn.updated_at.isoformat() if txn.updated_at else "",
                ]
            )

        # Prepare the CSV file for download
        output.seek(0)
        response = Response(output.getvalue(), mimetype="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=deposits.csv"
        return response

    except Exception as e:
        # Log the exception if needed
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


# Download Withdrawals
@admin_bp.route("/download-withdrawals", methods=["GET"])
@token_required
@AccessLevel.role_required(
    ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER", "MODERATOR", "SUPPORT"]
)
def download_withdrawals(current_user, *args, **kwargs):
    try:
        transactions = Transaction.query.filter(
            Transaction.transaction_type.like("withdraw%")
        ).all()

        if not transactions:
            return jsonify({"error": "No transactions found"}), 404

        output = StringIO()
        writer = csv.writer(output)
        # Updated header: added "Bank Name" column between Transaction Type and Transaction Completed
        writer.writerow(
            [
                "id",
                "user_id",
                "amount",
                "currency",
                "account_name",
                "account_number",
                "crypto_address",
                "transaction_type",
                "bank_name",
                "transaction_completed",
                "created_at",
                "updated_at",
            ]
        )

        for txn in transactions:
            # Safe conversion for datetime fields
            created_at = (
                txn.created_at.isoformat()
                if txn.created_at and isinstance(txn.created_at, dt)
                else ""
            )
            updated_at = (
                txn.updated_at.isoformat()
                if txn.updated_at and isinstance(txn.updated_at, dt)
                else ""
            )

            # Split the transaction_type field into type and bank name if applicable
            if " + " in txn.transaction_type:
                transaction_type, bank_name = txn.transaction_type.split(" + ", 1)
            else:
                transaction_type = txn.transaction_type
                bank_name = ""

            writer.writerow(
                [
                    txn.id,
                    txn.user_id,
                    txn.amount,
                    txn.currency,
                    txn.account_name,
                    txn.account_number,
                    txn.crypto_address,
                    transaction_type,
                    bank_name,
                    txn.transaction_completed,
                    created_at,
                    updated_at,
                ]
            )

        output.seek(0)
        response = Response(output.getvalue(), mimetype="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=withdrawals.csv"
        return response

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# Download Transactions
@admin_bp.route("/download-transactions", methods=["GET"])
@staticmethod
@token_required
@AccessLevel.role_required(
    ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER", "MODERATOR", "SUPPORT"]
)
def download_transactions(current_user, *args, **kwargs):
    # Query all transactions (deposits and withdrawals)
    transactions = Transaction.query.all()

    # Create a CSV file in memory
    output = StringIO()
    writer = csv.writer(output)

    # Write CSV headers
    writer.writerow(
        [
            "id",
            "user_id",
            "amount",
            "currency",
            "account_name",
            "account_number",
            "crypto_address",
            "transaction_type",
            "transaction_completed",
            "created_at",
            "updated_at",
        ]
    )

    # Write each transaction to the CSV file
    for txn in transactions:
        writer.writerow(
            [
                txn.id,
                txn.user_id,
                txn.amount,
                txn.currency,
                txn.account_name,
                txn.account_number,
                txn.crypto_address,
                txn.transaction_type,
                txn.transaction_completed,
                txn.created_at.isoformat() if txn.created_at else "",
                txn.updated_at.isoformat() if txn.updated_at else "",
            ]
        )

    # Set the response headers for CSV download
    output.seek(0)
    response = Response(output, mimetype="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=transactions.csv"
    return response


# Download User
@admin_bp.route("/download-users", methods=["GET"])
@staticmethod
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def download_users(current_user, *args, **kwargs):
    """
    Route to download all user data in CSV format.
    """
    users = User.query.all()  # Fetch all users

    # Create an in-memory file
    output = StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow(["ID", "Name", "Email", "Username", "Role", "Balance", "Referrals"])

    # Write user data
    for user in users:
        writer.writerow(
            [
                user.id,
                user.name,
                user.email,
                user.username,
                user.role,
                user.balance.balance if user.balance else 0.0,
                user.total_referrals,
            ]
        )

    # Set the response
    output.seek(0)
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=users.csv"},
    )


# Upload Transaction
@admin_bp.route("/upload-transactions", methods=["POST"])
@staticmethod
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def upload_transactions(current_user, *args, **kwargs):
    """
    Route to upload a CSV file and update deposits or withdrawals for users.
    The CSV should have columns: user_id, type (deposit/withdrawal), amount.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith(".csv"):
        return (
            jsonify({"error": "Invalid file format. Only CSV files are allowed."}),
            400,
        )

    try:
        # Read the CSV file
        stream = StringIO(file.stream.read().decode("UTF-8"))
        csv_reader = csv.DictReader(stream)

        # Validate columns
        required_columns = {"user_id", "type", "amount"}
        if not required_columns.issubset(csv_reader.fieldnames):
            return (
                jsonify(
                    {"error": "CSV file must contain user_id, type, and amount columns"}
                ),
                400,
            )

        # Process rows
        for row in csv_reader:
            user_id = row.get("user_id")
            transaction_type = row.get("type").strip().lower()
            amount = float(row.get("amount", 0.0))

            # Validate data
            if (
                not user_id
                or transaction_type not in {"deposit", "withdrawal"}
                or amount <= 0
            ):
                continue  # Skip invalid rows

            user = User.query.get(user_id)
            if not user:
                continue  # Skip if user does not exist

            if transaction_type == "deposit":
                user.balance.total_balance += amount  # Update deposit
            elif transaction_type == "withdrawal":
                user.balance.total_balance -= amount  # Update withdrawal

        # Commit updates to the database
        db.session.commit()
        return jsonify({"message": "Transactions updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# Upload Deposit
@admin_bp.route("/upload-deposit-csv", methods=["POST"])
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def upload_deposit_csv(current_user, *args, **kwargs):
    """
    Bulk upload deposits from a CSV file.

    Expected CSV columns (header names):
      - user_id
      - amount
      - account_name
      - account_number
      - transaction_type (should be 'deposit')
      - [optional] crypto_address
      - [optional] currency (defaults to 'naira')

    For each row, a new deposit transaction is created with the logged-in admin's ID
    recorded in the confirm_by field. The fiat amount is converted to dollars using the
    current conversion rate from the Utility table, and the user's balance is updated.
    """
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        # Read CSV content
        stream = StringIO(file.read().decode("utf-8"))
        csv_reader = csv.DictReader(stream)

        # Get the conversion rate from the Utility table
        utility = Utility.query.first()
        if not utility:
            return jsonify({"error": "Conversion rate not found in Utility table"}), 500
        conversion_rate = float(utility.conversion_rate)

        # Process each row in the CSV
        for row in csv_reader:
            # Validate that required fields exist and are non-empty
            required_fields = [
                "user_id",
                "amount",
                "account_name",
                "account_number",
                "transaction_type",
            ]
            missing_fields = [field for field in required_fields if not row.get(field)]
            if missing_fields:
                # Skip rows with missing required fields
                continue

            try:
                user_id = int(row["user_id"])
                amount = float(row["amount"])
            except ValueError:
                # Skip rows with invalid number formats
                continue

            if amount <= 0:
                # Skip rows with non-positive amount
                continue

            # Only process rows where the transaction type is 'deposit'
            transaction_type = row["transaction_type"].strip().lower()
            if transaction_type != "deposit":
                continue

            account_name = row["account_name"]
            account_number = row["account_number"]
            crypto_address = row.get("crypto_address", "")
            currency = row.get("currency", "naira")

            # Convert fiat amount to dollars using the conversion rate
            amount_in_dollars = amount / conversion_rate

            # Create a new Transaction with confirm_by set to the current admin's id
            transaction = Transaction(
                user_id=user_id,
                confirm_by=current_user.id,
                transaction_completed=True,
                account_name=account_name,
                account_number=account_number,
                crypto_address=crypto_address,
                transaction_type=transaction_type,
                amount=amount_in_dollars,
                currency=currency,
            )
            db.session.add(transaction)

            # Update the user's balance (for fiat deposits)
            balance = Balance.query.filter_by(user_id=user_id).first()
            if not balance:
                balance = Balance(
                    user_id=user_id,
                    balance=amount_in_dollars,
                    crypto_balance=0.0,
                    rewards=0.0,
                )
                db.session.add(balance)
            else:
                balance.balance += amount_in_dollars

        # Commit all transactions at once
        db.session.commit()
        return jsonify({"message": "Deposits uploaded successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        import traceback

        traceback.print_exc()
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


# Update User
@admin_bp.route("/update-user", methods=["PUT"])
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def update_user(current_user, *args, **kwargs):
    """
    Route to update user details.
    """
    data = request.get_json()

    print(f"{data=}")

    # Ensure user_id is provided in the request
    user_id = data.get("id")  # Allow updating any user
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    # Fetch user from database
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        # Allowed fields to update
        updatable_fields = [
            "name",
            "email",
            "username",
            "role",
            "sticks",
            "is_blocked",
            "is_verified",
        ]

        for field in updatable_fields:
            if field in data and hasattr(user, field):
                setattr(user, field, data[field])

        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@admin_bp.route("/referrals", methods=["GET"])
@token_required
def get_referrals(current_user, *args, **kwargs):
    """ Get all users that the current user has referred """
    referrals = User.query.filter_by(referrer_id=current_user.id).all()
    serialized_referrals = [referral.serialize() for referral in referrals]
    return jsonify({"referrals": serialized_referrals}), 200

@admin_bp.route("/referrer/<int:user_id>", methods=["GET"])
@token_required
def get_referrer_and_reward(current_user, user_id, *args, **kwargs):
    """ Get referrer details and reward """
    user = User.query.get(user_id)
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not user.referrer:
            return jsonify({"message": "This user was not referred by anyone"}), 404

        referrer = user.referrer
        return jsonify({
            "referrer_id": referrer.id,
            "referrer_name": referrer.name,
            "referrer_email": referrer.email,
            "referral_reward": referrer.referral_reward,
            "total_referrals": referrer.total_referrals,
        }), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
   
   
@admin_bp.route("/referrers-in-range", methods=["GET"])
@token_required
def get_referrers_in_range(current_user, *args, **kwargs):
    """ Get referrers within a date range """
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    try:
        start_date = dt.strptime(start_date, "%Y-%m-%d")
        end_date = dt.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    referrers = (
        User.query.filter(
            User.created_at >= start_date,
            User.created_at <= end_date,
            User.total_referrals > 0,
        )
        .order_by(User.total_referrals.desc())
        .all()
    )

    return jsonify({
        "referrers": [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "total_referrals": user.total_referrals,
                "referral_reward": user.referral_reward,
                "created_at": user.created_at.isoformat(),
            }
            for user in referrers
        ]
    }), 200


# Get users for admin dashboard
@admin_bp.route('/users/<int:user_id>/transactions', methods=['GET'])
def get_user_transactions(user_id):
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    return jsonify([tx.serialize() for tx in transactions])


@admin_bp.route('/users', methods=['GET'])
def get_users():
    query = User.query

    # Example: Filter by referrer_id if provided
    referrer_id = request.args.get('referrer_id')
    if referrer_id:
        query = query.filter(User.referrer_id == referrer_id)

    # Filtering by balance (assumes join with Balance)
    balance_min = request.args.get('balance_min', type=float)
    balance_max = request.args.get('balance_max', type=float)
    if balance_min is not None or balance_max is not None:
        query = query.join(Balance)
        if balance_min is not None:
            query = query.filter(Balance.balance >= balance_min)
        if balance_max is not None:
            query = query.filter(Balance.balance <= balance_max)

    # Filtering by crypto balance (assumes join with Crypto)
    crypto_min = request.args.get('crypto_min', type=float)
    crypto_max = request.args.get('crypto_max', type=float)
    if crypto_min is not None or crypto_max is not None:
        query = query.join(Crypto)
        if crypto_min is not None:
            query = query.filter(Crypto.amount >= crypto_min)
        if crypto_max is not None:
            query = query.filter(Crypto.amount <= crypto_max)

    users = query.all()
    # Use the admin serializer if you want additional fields
    return jsonify([user.serialize_admin() for user in users])


# Give user their reward manually
@admin_bp.route('/give-reward', methods=['POST'])
@token_required
@AccessLevel.role_required(["SUPER_ADMIN", "DEVELOPER", "OWNER"])
def give_reward(current_user, *args, **kwargs):
    """ Give user their reward manually """
    try:
        # Get reward settings
        reward_setting = RewardSetting.query.filter_by(is_active=True).first()
        utility = Utility.query.first()
        
        if not utility:
            return jsonify({"error": "Reward settings not found"}), 404
            
        if not reward_setting:
            return jsonify({"error": "No active reward setting found"}), 404
        
        # Current date for comparison
        current_date = datetime.utcnow()
        
        # If reward setting has end date and it's passed, don't give rewards
        if reward_setting.end_date and current_date > reward_setting.end_date:
            return jsonify({"error": "Reward period has ended"}), 400
            
        # Get reward percentage from utility
        reward_percentage = float(utility.reward_percentage)
        
        # Get all users or filter as needed
        users = User.query.all()
        rewarded_users = []
        total_rewards_given = 0
        
        for user in users:
            # Check if user has made deposits
            deposits = Transaction.query.filter_by(
                user_id=user.id,
                transaction_type='deposit',
                transaction_completed=True
            ).all()
            
            if not deposits:
                continue  # Skip users with no deposits
                
            # Calculate the user's deposit balance (sum of deposit transactions)
            deposit_balance = sum(deposit.amount for deposit in deposits)
            
            if deposit_balance <= 0:
                continue  # Skip users with zero or negative deposit balance
                
            # Check if the user has already received a reward in the last frequency_days
            last_reward = UserRewardHistory.query.filter_by(user_id=user.id).order_by(UserRewardHistory.created_at.desc()).first()
            if last_reward:
                days_since_last_reward = (current_date - last_reward.created_at).days
                if days_since_last_reward < reward_setting.frequency_days:
                    continue  # Skip if the user is not eligible for a new reward yet
                
            # Calculate reward based on deposit balance and reward percentage
            reward_amount = deposit_balance * float(reward_percentage)
            
            if reward_amount <= 0:
                continue  # Skip if calculated reward is zero or negative
                
            # Update user's referral_reward
            user.referral_reward += reward_amount
            
            # Create a reward transaction record
            reward_transaction = Transaction(
                user_id=user.id,
                confirm_by=current_user.id,
                transaction_completed=True,
                account_name=user.full_name,
                account_number="",
                crypto_address="",
                transaction_type="reward",
                amount=reward_amount,
                currency="usd",
            )
            db.session.add(reward_transaction)
            
            # Log the reward in UserRewardHistory
            reward_history = UserRewardHistory(
                user_id=user.id,
                amount=reward_amount,
                percentage_rate=reward_percentage,
                deposit_balance=deposit_balance
            )
            db.session.add(reward_history)
            
            # Add to our tracking lists
            rewarded_users.append({
                "user_id": user.id,
                "name": user.full_name,
                "email": user.email,
                "deposit_balance": deposit_balance,
                "reward_amount": reward_amount
            })
            total_rewards_given += reward_amount
        
        # Commit all changes to database
        db.session.commit()
        
        return jsonify({
            "message": f"Rewards distributed to {len(rewarded_users)} users",
            "total_rewards": total_rewards_given,
            "rewarded_users": rewarded_users
        }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


