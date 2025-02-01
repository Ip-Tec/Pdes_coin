from io import StringIO
import os
import csv
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
from flask import Blueprint, request, jsonify, Response, make_response
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
)
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

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
                "balance": (
                    user.balance.balance if user.balance else 0
                ),  # Extract balance
            }
            for user in top_users_by_balance
        ]

        top_users_by_crypto_balance_data = [
            {
                "id": user.id,
                "name": user.name,
                "username": user.username,
                "crypto_balance": (
                    user.balance.crypto_balance if user.balance else 0
                ),  # Extract crypto balance
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
@token_required
@AccessLevel.role_required(["ADMIN", "DEVELOPER", "SUPER_ADMIN"])
def confirm_user_deposit(current_user, *args, **kwargs):
    try:
        # Get the user_id from the request data
        data = request.get_json()
        user_id = data.get("user_id")
        print(f"data:: {data=}")

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
        print(f"Converted amount: {amount_in_dollars} USD")

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
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
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
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
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
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
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
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
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


@admin_bp.route("/configure-reward-setting", methods=["POST"])
@staticmethod
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
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
@staticmethod
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
def download_deposits(current_user, *args, **kwargs):
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

    # Set the response headers for CSV download
    output.seek(0)
    response = Response(output, mimetype="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=deposits.csv"
    return (
        jsonify({"message": "Deposits downloaded successfully!", "data": response}),
        200,
    )


# Download Withdrawals
@admin_bp.route("/download-withdrawals", methods=["GET"])
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
def download_withdrawals(current_user):
    try:
        transactions = Transaction.query.filter(
            Transaction.transaction_type.like("withdraw%")
        ).all()

        if not transactions:
            return jsonify({"error": "No transactions found"}), 404

        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(
            ["ID", "User ID", "Amount", "Currency", "Account Name", 
             "Account Number", "Crypto Address", "Transaction Type", 
             "Transaction Completed", "Created At", "Updated At"]
        )

        for txn in transactions:
            print(txn.serialize())  # Log each transaction
            writer.writerow([
                txn.id, txn.user_id, txn.amount, txn.currency,
                txn.account_name, txn.account_number, txn.crypto_address,
                txn.transaction_type, txn.transaction_completed,
                txn.created_at.isoformat() if txn.created_at else "",
                txn.updated_at.isoformat() if txn.updated_at else ""
            ])

        output.seek(0)
        response = make_response(output.getvalue())
        response.headers["Content-Disposition"] = "attachment; filename=withdrawals.csv"
        response.headers["Content-Type"] = "text/csv"
        return response

    except Exception as e:
        print("Error in download_withdrawals:", str(e))  # Log error in console
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# Download Transactions
@admin_bp.route("/download-transactions", methods=["GET"])
@staticmethod
@token_required
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
def download_transactions(current_user, *args, **kwargs):
    # Query all transactions (deposits and withdrawals)
    transactions = Transaction.query.all()

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
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
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
@AccessLevel.role_required(["ADMIN", "SUPER_ADMIN", "DEVELOPER"])
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
