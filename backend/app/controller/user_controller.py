import re
import jwt
import datetime
from app import db
from app.models import Notification, User
from flask import current_app, request, jsonify
from app.key_gen import generate_key
from app.services import (
    generate_access_token,
    generate_password_reset_token,
    generate_refresh_token,
    token_required,
    verify_reset_token,
)
from app.utils import validate_required_param
from app.mail.user_mail import Email
from werkzeug.security import generate_password_hash, check_password_hash


class UserController:
    """
    User Controller Class
    """

    # Get login user information
    @staticmethod
    @token_required
    def get_user(current_user):
        # Use current_user instead of request.user_id
        if current_user:
            return jsonify({"message": current_user.serialize()}), 200
        else:
            return jsonify({"message": "User not found"}), 404

    # Find a user by id
    @staticmethod
    def get_user_by_id(user_id):
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({"message": "User not found"}), 404
        return jsonify({"message": user.serialize()}), 200

    # Find a user by email
    @staticmethod
    def get_user_by_email(email):
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "User not found"}), 404
        return jsonify({"message": user.serialize()}), 200

    @staticmethod
    def login():
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        for param, param_name in [(email, "Email"), (password, "Password")]:
            validation_error = validate_required_param(param, param_name)
            if validation_error:
                return validation_error

        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            # Use the app's SECRET_KEY from config
            access_token = generate_access_token(user.id)
            refresh_token = generate_refresh_token(user.id)

            return (
                jsonify(
                    {
                        "access_token": access_token,
                        "refresh_token": refresh_token,
                        "user": user.serialize(),
                    }
                ),
                200,
            )

        else:
            return jsonify({"message": "Invalid credentials"}), 401

    @staticmethod
    def register():
        """
        Register user
        """
        data = request.get_json()

        # Extract required fields
        name = data.get("fullName") or data.get("name")
        email = data.get("email")
        username = data.get("username") or generate_key(4)
        password = data.get("password")
        confirmPassword = data.get("confirmPassword")

        valid_email = is_valid_email(email)
        if not valid_email:
            return jsonify({"message": "Invalid email format"}), 400

        # Check if password and confirm password match
        if password != confirmPassword:
            return (
                jsonify({"message": "Password and confirm password do not match"}),
                400,
            )

        # Validate required fields
        for param, param_name in [
            (name, "Name"),
            (email, "Email"),
            (password, "Password"),
        ]:
            validation_error = validate_required_param(param, param_name)
            if validation_error:
                return validation_error

        # Validate referral code if provided
        referral_code = data.get("referral_code", None)
        referrer = None
        if referral_code:
            referrer = User.query.filter_by(referral_code=referral_code).first()
            if not referrer:
                return jsonify({"message": "Invalid referral code"}), 400

        # Check if email is already registered
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already registered"}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Assign a default role if no role is provided
        role = data.get("role", "user")  # Default role is 'user'

        # Create a new user
        user = User(
            name=name,
            email=email,
            username=username,
            password=hashed_password,
            referral_code=referral_code,
            role=role,  # Assign the role to the user
        )

        db.session.add(user)
        db.session.commit()

        # Update referrer stats if referral_code was used
        if referrer:
            referrer.total_referrals += 1
            db.session.commit()

        # Optionally send a registration email
        token = generate_password_reset_token(user.email)
        try:
            Email.send_register_email(user, token)
            return (
                jsonify(
                    {
                        "message": "User registered successfully. A confirmation email has been sent."
                    }
                ),
                201,
            )
        except Exception as e:
            return (
                jsonify(
                    {
                        "message": "User registered successfully.",
                        "email_error": "Error sending registration email. Please check your email configuration or try again later.",
                        "error_details": str(e),
                    }
                ),
                202,
            )

    @staticmethod
    def update_user_info():
        """
        Update user info
        """
        data = request.get_json()
        user_id = data.get("id")
        email = data.get("email")
        username = data.get("username")

        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        user.email = email
        user.username = username
        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200

    @staticmethod
    @token_required
    def reset_password(current_user):
        """
        Reset or change password based on the provided data.
        Handles logged-in users and token-based password resets.
        """
        data = request.get_json()
        email = data.get("email")
        token = data.get("token")
        old_password = data.get("password")
        new_password = data.get("newPassword")

        if not email or not new_password:
            return jsonify({"message": "Email and new password are required"}), 400

        # Find the user by email
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Handle token-based reset
        if token:
            if not verify_reset_token(token):
                return jsonify({"message": "Invalid or expired token"}), 400
        else:
            # Handle logged-in user reset
            if not old_password:
                return jsonify({"message": "Old password is required"}), 400
            if not check_password_hash(user.password, old_password):
                return jsonify({"message": "Old password is incorrect"}), 401

        # Update the password
        user.password = generate_password_hash(new_password)
        db.session.commit()

        return jsonify({"message": "Password reset successfully"}), 200

    # Sende Password Reset Link to Email
    @staticmethod
    def send_password_reset_link_to_user_email(email):
        """
        Send password reset link to email
        """
        data = request.get_json()
        email = data.get("email")

        user = User.query.filter_by(email=email).first()
        token = generate_password_reset_token(email)
        if not user:
            return jsonify({"message": "User not found"}), 404
        try:
            Email.send_password_reset_email(email, token)
            return jsonify({"message": "Password reset link sent to your email"}), 200
        except Exception as e:
            return (
                jsonify({"message": f"Error sending password reset link: {str(e)}"}),
                500,
            )

    @staticmethod
    @token_required
    def delete_user():
        """
        Delete user
        """
        data = request.get_json()
        user_id = data.get("id")

        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200

    # Get all users that the current user referral
    @staticmethod
    @token_required
    def get_referrals(current_user):
        """
        Get all users that the current user has referred.
        """
        print("current_user:::>", current_user)

        if current_user:
            # Query users where referrer_id matches current user's referral_code
            referrals = User.query.filter_by(referrer_id=current_user.id).all()

            # Serialize the referrals
            serialized_referrals = [referral.serialize() for referral in referrals]

            print("get_referrals:::>", serialized_referrals)

            return jsonify({"referrals": serialized_referrals}), 200
        else:
            return jsonify({"message": "User not found"}), 404


# Send reward notification
def send_reward_notification(user, reward):
    notification = Notification(
        user_id=user.id,
        message=f"You have received a reward of {reward:.2f} PDES.",
        is_read=False,
    )
    db.session.add(notification)
    db.session.commit()


def is_valid_email(email):
    regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    match = re.match(regex, email)
    return email if match else None
