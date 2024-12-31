from flask import Blueprint, request, jsonify
from app.controller import user_controller

auth_bp = Blueprint("auth", __name__)

# Login router
@auth_bp.route("/login", methods=["POST"])
def login():
    user = user_controller.UserController.login()
    return user

# Register router
@auth_bp.route("/register", methods=["POST"])
def register():
    user=user_controller.UserController.register()
    return user

# Logout router
@auth_bp.route("/logout", methods=["POST"])
def logout():
    # Add logout logic here
    return jsonify({"message": "Logout successful"})

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
