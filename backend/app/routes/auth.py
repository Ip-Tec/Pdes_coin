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

# Add these token creation functions
def create_access_token(identity):
    """
    Create a new access token for the given user identity
    """
    payload = {
        "user_id": identity,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=3),  # 3 hour expiry
        "iat": datetime.datetime.utcnow(),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def create_refresh_token(identity):
    """
    Create a new refresh token for the given user identity
    """
    payload = {
        "user_id": identity,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=30),  # 30 day expiry
        "iat": datetime.datetime.utcnow(),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

# Login router with rate limiting
@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    # old code
    # user = user_controller.UserController.login()
    # return user
    data = request.get_json()
    email = data.get("email", "").lower()
    password = data.get("password", "")
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    # Prepare response with user data
    response = jsonify({
        "message": "Login successful",
        "user": user.serialize(),
        "access_token": access_token,
        "refresh_token": refresh_token
    })
    
    # Set secure cookies with proper attributes
    max_age = 60 * 60 * 24 * 30  # 30 days
    
    # Set the cookies with all necessary attributes
    response.set_cookie(
        'access_token', 
        access_token, 
        httponly=True, 
        secure=False,  # Set to True in production with HTTPS
        samesite='Lax',
        max_age=max_age,
        path='/'
    )
    
    response.set_cookie(
        'refresh_token', 
        refresh_token, 
        httponly=True, 
        secure=False,  # Set to True in production with HTTPS
        samesite='Lax', 
        max_age=max_age,
        path='/'
    )
    
    print(f"Login successful for {email}, setting cookies: access_token, refresh_token")
    return response, 200

# Register router with rate limiting
@auth_bp.route("/register", methods=["POST"])
@limiter.limit("3 per minute") 
def register():
    user = user_controller.UserController.register()
    return user

# Logout router
@auth_bp.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"message": "Successfully logged out"}))
    
    # Clear all auth cookies
    response.delete_cookie("access_token", path="/", domain=None)
    response.delete_cookie("refresh_token", path="/", domain=None)
    
    # For added security, set cookies with empty values and immediate expiration
    response.set_cookie("access_token", "", expires=0, httponly=True, secure=True, samesite="Lax")
    response.set_cookie("refresh_token", "", expires=0, httponly=True, secure=True, samesite="Lax")
    
    print("Logout response prepared with cookies cleared")
    
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
