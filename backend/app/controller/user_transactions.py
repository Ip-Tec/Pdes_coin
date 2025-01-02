import jwt
import datetime
from app import db
from app.models import User,Transaction, Crypto, Balance
from flask import request, jsonify
from app.key_gen import generate_key
from app.services import token_required
from app.utils import validate_required_param
from app.mail.user_mail import send_password_reset_email, send_register_email

class UserTransactionsController:
    """
    Controller for user transactions
    """
    # Get user transactions history
    @staticmethod
    @token_required
    def get_transactions():
        # Get the login user id from the token
        user_id = request.user_id
        # Get the user transactions history
        transactions = Transaction.query.filter_by(user_id=user_id).all()
        # Return the user transactions history
        return jsonify({"message": [transaction.serialize() for transaction in transactions]}), 200
    
    # Get user transactions history by id
    @staticmethod
    @token_required
    def get_transaction(id):
        # Implement logic to retrieve user transactions history by id
        # Get the login user id from the token
        user_id = request.user_id
        # Get the user transactions history by id
        transaction = Transaction.query.filter_by(user_id=user_id, id=id).first()
        # Return the user transactions history
        return jsonify({"message": transaction.serialize()}), 200
    
    # Add user transactions
    @staticmethod
    @token_required
    def add_transaction():
        # Implement logic to add user transactions 
        # Get the login user id from the token
        user_id = request.user_id
        # Get the user transactions 
        data = request.get_json()
        # Get the user transactions 
        transaction = Transaction(user_id=user_id, 
                                  amount=data['amount'], 
                                  account_name=data['account_name'], 
                                  account_number=data['account_number'], 
                                  transaction_type=data["transaction_type"])
        # Add the user transactions 
        db.session.add(transaction)
        db.session.commit()
        # Return the user transactions 
        return jsonify({"message": transaction.serialize()}), 201
    
    # Update user transactions
    @staticmethod
    @token_required
    def update_transaction():
        # Implement logic to update user transactions 
        # Get the login user id from the token
        user_id = request.user_id
        # Get the user transactions 
        data = request.get_json()
        # Get the user transactions 
        transaction = Transaction.query.filter_by(user_id=user_id, id=data['id']).first()
        # Update the user transactions 
        transaction.amount = data['amount']
        transaction.account_name = data['account_name']
        transaction.account_number = data['account_number']
        transaction.transaction_type = data["transaction_type"]
        db.session.commit()
        # Return the user transactions 
        return jsonify({"message": transaction.serialize()}), 200
    
    # Delete user transactions
    @staticmethod
    @token_required
    def delete_transaction():
        # Implement logic to delete user transactions 
        # Get the login user id from the token
        user_id = request.user_id
        # Get the user transactions 
        data = request.get_json()
        # Get the user transactions 
        transaction = Transaction.query.filter_by(user_id=user_id, id=data['id']).first()
        # Delete the user transactions 
        db.session.delete(transaction)
        db.session.commit()
        # Return the user transactions 
        return jsonify({"message": "Transaction deleted successfully"}), 200
    
    
    # Add money to wallet and update balance
    @staticmethod
    @token_required
    def add_money():
        # Get the login user id from the token
        user_id = request.user_id
        # Get the user transactions
        data = request.get_json()
        # Get the user transactions
        transaction = Transaction(user_id=user_id,
                                  amount=data['amount'],
                                  account_name=data['account_name'],
                                  account_number=data['account_number'],
                                  transaction_type=data["transaction_type"])
        # Add the user transactions
        db.session.add(transaction)
        db.session.commit()
        # Update the user balance
        balance = Balance.query.filter_by(user_id=user_id).first()
        balance.balance += data['amount']
        db.session.commit()
        # Return the user transactions
        return jsonify({"message": transaction.serialize()}), 201
    
    # withdraw money from wallet and update balance
    @staticmethod
    @token_required
    def withdraw_money():
        # Get the login user id from the token
        user_id = request.user_id
        # Get the user transactions
        data = request.get_json()
        # Get the user transactions
        transaction = Transaction(user_id=user_id,
                                  amount=data['amount'],
                                  account_name=data['account_name'],
                                  account_number=data['account_number'],
                                  transaction_type=data["transaction_type"])
        # Add the user transactions
        db.session.add(transaction)
        db.session.commit()
        # Update the user balance
        balance = Balance.query.filter_by(user_id=user_id).first()
        balance.balance -= data['amount']
        db.session.commit()
        # Return the user transactions
        return jsonify({"message": transaction.serialize()}), 201
    
    # Buy crypto
    @staticmethod
    @token_required
    def buy_crypto():
        user_id = request.user_id
        data = request.get_json()
        amount = data.get("amount")

        # Retrieve user's balance
        balance_record = Balance.query.filter_by(user_id=user_id).first()
        if not balance_record:
            return jsonify({"error": "User balance record not found"}), 404

        # Check if the user has sufficient balance
        if balance_record.crypto_balance < amount:
            return jsonify({"error": "Insufficient balance"}), 400

        # Deduct the amount from the user's balance
        balance_record.balance -= amount

        # Create the crypto transaction
        crypto = Crypto(
            user_id=user_id,
            crypto_balance=amount,
            crypto_name=data["crypto_name"],
            account_address=data["account_address"],
        )

        # Commit changes
        db.session.add(crypto)
        db.session.commit()

        return jsonify({"message": crypto.serialize()}), 201
    
    # sell crypto
    @staticmethod
    @token_required
    def sell_crypto():
        user_id = request.user_id
        data = request.get_json()
        amount = data.get("amount")

        # Retrieve user's balance
        balance_record = Balance.query.filter_by(user_id=user_id).first()
        if not balance_record:
            return jsonify({"error": "User balance record not found"}), 404

        # Check if the user has sufficient balance
        if balance_record.crypto_balance < amount:
            return jsonify({"error": "Insufficient balance"}), 400

        # Deduct the amount from the user's balance
        balance_record.balance -= amount

        # Create the crypto transaction
        crypto = Crypto(
            user_id=user_id,
            crypto_balance=amount,
            crypto_name=data["crypto_name"],
            account_address=data["account_address"],
        )

        # Commit changes
        db.session.add(crypto)
        db.session.commit()

        return jsonify({"message": crypto.serialize()}), 201