from flask import Blueprint, jsonify

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
def get_users():
    # Fetch users from the database
    return jsonify({"users": []})
