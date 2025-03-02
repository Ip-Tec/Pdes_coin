from app import db, socketio
from flask_cors import cross_origin
from flask import Blueprint, jsonify
from app.services import token_required
from flask_socketio import SocketIO, emit
from app.controller.user_controller import UserController
import jwt
from flask import request, current_app

users_bp = Blueprint("users", __name__)


@socketio.on('connect')
def handle_connect():
    try:
        # Get token from request cookies
        token = request.cookies.get('access_token')
        
        # For debugging
        print(f"Socket connection attempt, cookies: {request.cookies}")
        
        if not token:
            # Try to get from headers or query params as fallback
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            if not token:
                token = request.args.get('token')
                
        if not token:
            print("No token found in socket connection")
            return False
            
        # Verify token
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload.get('user_id')
            
            if not user_id:
                print("Invalid token payload")
                return False
                
            print(f"Socket authenticated: User {user_id}")
            return True
        except jwt.ExpiredSignatureError:
            print("Token expired")
            return False
        except jwt.InvalidTokenError:
            print("Invalid token")
            return False
            
    except Exception as e:
        print(f"Socket auth error: {str(e)}")
        return False


# Get Login user info
@users_bp.route("/users_info", methods=["GET", "OPTIONS"])
@token_required
def get_users(current_user, *args, **kwargs):
    get_users = UserController.get_user()
    return get_users

# find user by id
# @users_bp.route("/user/<int:user_id>", methods=["GET"])
# def get_user(user_id):
#     # Fetch user from the database
#     get_user = UserController.get_user_by_id(user_id)
#     return get_user

# User referral router
@users_bp.route("/referral", methods=["GET"])
def get_referral():
    # Implement logic to create a referral
    referral = UserController.get_referrals()
    # For now, let's return a dummy response
    return referral


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
