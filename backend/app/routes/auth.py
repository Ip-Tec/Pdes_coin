import os
import jwt
import datetime
from app import db
from app.models import User
from datetime import timedelta
from dotenv import load_dotenv
from app.controller import user_controller
from flask import Blueprint, request, jsonify, current_app, make_response
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.services import (
    generate_password_reset_token,
    generate_refresh_token,
    token_required,
)

load_dotenv()

auth_bp = Blueprint("auth", __name__)
SECRET_KEY = os.getenv("SECRET_KEY")

# Initialize Flask-Limiter
limiter = Limiter(
    key_func=get_remote_address,
    app=current_app,
    default_limits=["15 per hour"]
)

# Login router with rate limiting
@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    user = user_controller.UserController.login()
    return user

# Register router with rate limiting
@auth_bp.route("/register", methods=["POST"])
@limiter.limit("3 per minute") 
def register():
    user = user_controller.UserController.register()
    return user

# Logout router
@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout(current_user, *args, **kwargs):
    # Get the user from the database
    user_id = current_user.id
    user = User.query.filter_by(id=user_id).first()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Invalidate the refresh token in the database
    user.refresh_token = None
    db.session.commit()
    
    # Create a response and clear the cookies
    response = make_response(jsonify({"message": "Logged out successfully!"}), 200)
    response.set_cookie("access_token", "", expires=0, httponly=True, secure=True, samesite="Lax")
    response.set_cookie("refresh_token", "", expires=0, httponly=True, secure=True, samesite="Lax")
    
    return response


# Forgot Password router
@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("3 per hour") 
def forgot_password():
    data = request.json
    email = data.get("email")
    # Send the reset token to the user's email
    return user_controller.UserController.send_password_reset_link_to_user_email(email)


# Reset Password router
@auth_bp.route("/forget-password", methods=["POST"])
@limiter.limit("5 per hour")
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
@limiter.limit("10 per hour")
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
@limiter.limit("5 per hour")
def refresh_token():
    # Retrieve refresh token from cookies
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return jsonify({"message": "Refresh token is missing"}), 401

    try:
        # Decode the refresh token
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Refresh token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid refresh token"}), 401

    # Generate a new access token (and optionally a new refresh token)
    new_payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=3),  # New access token expiry
        "iat": datetime.utcnow(),
    }
    new_access_token = jwt.encode(new_payload, SECRET_KEY, algorithm="HS256")

    # Optionally, you can rotate the refresh token here and set a new one

    # Set the new access token in an HttpOnly cookie
    response = make_response(
        jsonify({"message": "Token refreshed successfully", "access_token": new_access_token}), 200
    )
    response.set_cookie("access_token", new_access_token, httponly=True, secure=True, samesite="Lax")
    return response
