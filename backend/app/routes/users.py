from flask import Blueprint, jsonify
from app.controller.user_controller import UserController

users_bp = Blueprint("users", __name__)


# Get Login user info
@users_bp.route("/user", methods=["GET", "OPTIONS"])
def get_users():
    # Fetch users from the database
    get_users = UserController.get_user()
    return get_users

# find user by id
@users_bp.route("/user/<int:user_id>", methods=["GET"])
def get_user(user_id):
    # Fetch user from the database
    get_user = UserController.get_user_by_id(user_id)
    return get_user

# User referral router
@users_bp.route("/referral", methods=["GET", "POST"])
def create_referral():
    # Implement logic to create a referral
    # For now, let's return a dummy response
    return jsonify({"message": "Create referral endpoint"})

# User profile router


@users_bp.route("/profile", methods=["GET"])
def get_user_profile():
    # Implement logic to retrieve user profile
    # For now, let's return a dummy response
    return jsonify({"message": "User profile endpoint"})

# User update router


@users_bp.route("/update", methods=["PUT"])
def update_user_profile():
    # Implement logic to update user profile
    # For now, let's return a dummy response
    return jsonify({"message": "Update user profile endpoint"})

# User delete router


@users_bp.route("/delete", methods=["DELETE"])
def delete_user_profile():
    # Implement logic to delete user profile
    # For now, let's return a dummy response
    return jsonify({"message": "Delete user profile endpoint"})
