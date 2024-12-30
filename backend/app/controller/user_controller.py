from app import db
from app.models import User
from flask import request, jsonify
from app.key_gen import generate_referral_code
from app.mail.user_mail import send_password_reset_email, send_register_email
from werkzeug.security import generate_password_hash, check_password_hash

class UserController:
    """
    User Controller Class
    """

    @staticmethod
    def login():
        """
        Login user
        """
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401

    @staticmethod
    def register():
        """
        Register user
        """
        data = request.get_json()
        email = data.get("email")
        username = data.get("username")
        password = data.get("password")
        referral_code = generate_referral_code()
        
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already registered"}), 400
        
        hashed_password = generate_password_hash(password)
        user = User(email=email, username=username, password=hashed_password, referral_code=referral_code)
        db.session.add(user)
        db.session.commit() 
        send_register_email(username=username, recipient=email)
        return jsonify({"message": "User registered successfully"}), 201

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
    def reset_password():
        """
        Reset password
        """
        data = request.get_json()
        email = data.get("email")
        new_password = data.get("password")
        
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        user.password = generate_password_hash(new_password)
        db.session.commit()
        return jsonify({"message": "Password reset successfully"}), 200

    @staticmethod
    def send_password_reset_link():
        """
        Send password reset link to email
        """
        data = request.get_json()
        email = data.get("email")
        
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # TODO: Implement link generation logic (e.g., using JWT or a token system)
        reset_link = f"https://pdes.xyz/auth/reset-password?email={email}"

        try:
            send_password_reset_email(recipient=email, reset_link=reset_link)
            return jsonify({"message": "Password reset link sent to your email", "link": reset_link}), 200
        except Exception as e:
            return jsonify({"message": f"Error sending password reset link: {str(e)}"}), 500
        

    @staticmethod
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
