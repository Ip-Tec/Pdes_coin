import os
import jwt
import datetime
from dotenv import load_dotenv
from app.controller import user_controller
from flask import Blueprint, request, jsonify, current_app
from app.services import generate_refresh_token


load_dotenv()

auth_bp = Blueprint("auth", __name__)
SECRET_KEY = os.getenv("SECRET_KEY")

# Login router
@auth_bp.route("/login", methods=["POST"])
def login():
    user = user_controller.UserController.login()
    print(f"{user}")
    return user

# Register router
@auth_bp.route("/register", methods=["POST"])
def register():
    user=user_controller.UserController.register()
    return user

# Logout router
@auth_bp.route("/logout", methods=["POST"])
def logout():
    refresh_token = request.json.get("refresh_token")
    # Optionally, store and invalidate refresh tokens in a database
    # For now, we assume the token is client-side only
    return jsonify({"message": "Logged out successfully!"}), 200

# Forgot Password router
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    # Add forgot password logic here
    return jsonify({"message": "Password reset instructions sent"})

# Reset Password router
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    # Add reset password logic here
    return jsonify({"message": "Password reset successful"})

# Change Password router
@auth_bp.route("/change-password", methods=["POST"])
def change_password():
    data = request.json
    # Add change password logic here
    return jsonify({"message": "Password changed successfully"})

# Verify Email router
@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
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
        "iat": datetime.utcnow()  # Issued at time
    }
    
    # Add refresh token logic here
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return jsonify({"message": "Token refreshed successfully", "token": token})
