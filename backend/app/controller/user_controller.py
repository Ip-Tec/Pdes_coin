import jwt
import datetime
from app import db
from app.models import User
from flask import request, jsonify
from app.key_gen import generate_key
from app.services import token_required
from app.utils import validate_required_param
from app.mail.user_mail import send_password_reset_email, send_register_email
from werkzeug.security import generate_password_hash, check_password_hash

class UserController:
    """
    User Controller Class
    """
    SECRET_KEY = generate_key(88)


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
            token = jwt.encode(
                {"user_id": user.id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
                UserController.SECRET_KEY,
                algorithm="HS256"
            )
            return jsonify({"message": "Login successful", "token": token}), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401

    @staticmethod
    def register():
        """
        Register user
        """
        data = request.get_json()

        # Extract required fields
        # if the use user name is provided, use it, otherwise use fullName
        
        name = data.get("fullName") or data.get("name")
        email = data.get("email")
        username = data.get("username") or generate_key(4)
        password = data.get("password")
        confirmPassword = data.get("confirmPassword")

        # check if password and confirm password match
        if password != confirmPassword:
            return jsonify({"message": "Password and confirm password do not match"}), 400


        # Validate required fields using the helper function
        for param, param_name in [(name, "Name"), (email, "Email"), (password, "Password")]:
            validation_error = validate_required_param(param, param_name)
            if validation_error:
                return validation_error

        # If the referral_code is provided, check if it exists in the database
        referral_code = data.get("referral_code", None)
        referrer = None
        if referral_code:
            referrer = User.query.filter_by(referral_code=referral_code).first()
            if not referrer:
                print({"message": "Invalid referral code"})
                return jsonify({"message": "Invalid referral code"}), 400

        # Check if email is already registered
        if User.query.filter_by(email=email).first():
            print({"message": "Email already registered"})
            return jsonify({"message": "Email already registered"}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Create a new user
        user = User(
            name=name,
            email=email,
            username=username,
            password=hashed_password,
            referral_code=referral_code
        )

        db.session.add(user)
        db.session.commit()

        # Update referrer stats if referral_code was used
        if referrer:
            referrer.total_referrals += 1
            db.session.commit()

        # Optionally send a registration email
        try:
            send_register_email(username=username, recipient=email)
            # If email is sent successfully, return success message
            return jsonify({"message": "User registered successfully. A confirmation email has been sent."}), 201
        except Exception as e:
            # If email fails, still return success message but notify user of the failure
            return jsonify({
                "message": "User registered successfully.",
                "email_error": "Error sending registration email. Please check your email configuration or try again later.",
                "error_details": str(e)
            }), 202

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
