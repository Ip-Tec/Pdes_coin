import os
import jwt
import datetime
from app import db
from app.models import User
from dotenv import load_dotenv
from app.controller import user_controller
from flask import Blueprint, request, jsonify, current_app
from app.services import (
    generate_password_reset_token,
    generate_refresh_token,
    token_required,
)


load_dotenv()

auth_bp = Blueprint("auth", __name__)
SECRET_KEY = os.getenv("SECRET_KEY")


# Login router
@auth_bp.route("/login", methods=["POST"])
def login():
    user = user_controller.UserController.login()
    return user


# Register router
@auth_bp.route("/register", methods=["POST"])
def register():
    user = user_controller.UserController.register()
    return user


# Logout router
@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout(current_user, *args, **kwargs):
    # Add logout logic here
    user_id = current_user.id
    # fine user with the User id
    user = User.query.filter_by(id=user_id).first()
    print(f"user::: {user}")
    if not user:
        return jsonify({"error": "User not found"}), 404
    # update user's refresh token to None
    user.refresh_token = None
    db.session.commit()
    
    return jsonify({"message": "Logged out successfully!"}), 200


# Forgot Password router
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email")
    # Send the reset token to the user's email
    return user_controller.UserController.send_password_reset_link_to_user_email(email)


# Reset Password router
@auth_bp.route("/forget-password", methods=["POST"])
def forget_password():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:

        return user_controller.UserController.forget_password()
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Change Password router
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    token = data.get("token")
    new_password = data.get("newPassword")

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required"}), 400

    try:
        # Validate the reset token and update the password
        return user_controller.UserController.reset_password()
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Change Password (Authenticated Users Only)
@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password(current_user, *args, **kwargs):
    data = request.json
    current_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    if not current_password or not new_password:
        return jsonify({"error": "Current and new passwords are required"}), 400

    try:
        # Verify the current password and change the password
        user_controller.UserController.change_password(current_password, new_password)
        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Verify Email router
@auth_bp.route("/verify-email/<token>", methods=["GET"])
def verify_email(token):
    data = request.json
    # Add email verification logic here
    return jsonify({"message": "Email verified successfully"})


# Resend Verification Email router
@auth_bp.route("/resend-verification", methods=["POST"])
def resend_verification():
    data = request.json
    # Add resend verification email logic here
    return jsonify({"message": "Verification email resent"})


# Refresh Token Router
@auth_bp.route("/refresh-token", methods=["POST"])
def refresh_token():
    data = request.json
    payload = {
        "user_id": data.id,
        "exp": datetime.utcnow() + datetime.timedelta(hours=3),
        "iat": datetime.utcnow(),  # Issued at time
    }

    # Add refresh token logic here
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return {"message": "Token refreshed successfully", "token": token}
