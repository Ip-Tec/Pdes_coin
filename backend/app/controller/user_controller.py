import hashlib
import re
import os
import jwt
import datetime
from datetime import timedelta, datetime as dt
from app import db
from app.mail.user_mail import Email
from flask import current_app, request, jsonify
from app.key_gen import generate_key
from app.services import (
    generate_access_token,
    generate_password_reset_token,
    generate_refresh_token,
    token_required,
    verify_reset_token,
)
from app.utils import validate_required_param
from app.enumValue import TicketPriority, TicketStatus
from app.models import Notification, SupportResponse, SupportTicket, User
from werkzeug.security import generate_password_hash, check_password_hash


class UserController:
    """
    User Controller Class
    """

    # Get login user information

    # @token_required
    def get_user():
        # Use current_user instead of request.user_id
        # Get User from the database
        print(f"current_user:::::::::")
        user = User.query.filter_by(id=1).first()
        print(f"current_user=", user)
        if user:
            return jsonify(user.serialize()), 200
        else:
            return jsonify({"message": "User not found"}), 404

    # Find a user by id
    @staticmethod
    def get_user_by_id(user_id):
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({"message": "User not found"}), 404
        return jsonify({"message": user.serialize()}), 200

    @staticmethod
    def get_current_user_id():
        user_id = request.user_id
        return jsonify({"message": user_id}), 200

    # Find a user by email
    @staticmethod
    def get_user_by_email(email):
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "User not found"}), 404
        return jsonify({"message": user.serialize()}), 200

    # Login user
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
            # Use the app's SECRET_KEY from config
            access_token = generate_access_token(user.id)
            refresh_token = generate_refresh_token(user.id)

            return (
                jsonify(
                    {
                        "access_token": access_token,
                        "refresh_token": refresh_token,
                        "user": user.serialize(),
                    }
                ),
                200,
            )

        else:
            return jsonify({"message": "Invalid credentials"}), 401

    @staticmethod
    def register():
        """
        Register a new user with referral functionality integrated into the User model.
        """
        data = request.get_json()

        # Extract and validate input fields
        name = data.get("fullName") or data.get("name")
        email = data.get("email")
        username = data.get("username") or generate_key(6)
        password = data.get("password")
        confirmPassword = data.get("confirmPassword")
        referral_code = data.get("referralCode", None)
        role = data.get("role", "user")  # Default to 'user'

        # Validate email format
        if not is_valid_email(email):
            return jsonify({"message": "Invalid email format"}), 400

        # Validate passwords
        if password != confirmPassword:
            return (
                jsonify({"message": "Password and confirm password do not match"}),
                400,
            )

        # Check required fields
        for param, param_name in [
            (name, "Name"),
            (email, "Email"),
            (password, "Password"),
        ]:
            validation_error = validate_required_param(param, param_name)
            if validation_error:
                return validation_error

        # Check for existing email
        if User.query.filter_by(email=email).first():
            print("email::::", email)
            return jsonify({"message": "Email is already registered"}), 400

        # Check for existing username
        if User.query.filter_by(username=username).first():
            return jsonify({"message": "Username is already taken"}), 400

        # Validate referral code if provided
        referrer = None
        if referral_code:
            referrer = User.query.filter_by(username=referral_code).first()
            if not referrer:
                return jsonify({"message": "Invalid referral code"}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Create the new user
        user = User(
            name=name,
            email=email,
            username=username,
            password=hashed_password,
            referral_code=username,  # Use the username as the referral code
            referrer_id=referrer.id if referrer else None,  # Link the referrer
        )

        # Add user to the database session
        db.session.add(user)

        # Update referrer stats if a valid referral was used
        if referrer:
            referrer.total_referrals += 1
            # Optionally, you can calculate rewards here
            # referrer.referral_reward += REWARD_AMOUNT

        # Commit all changes
        db.session.commit()

        # Send registration email
        try:
            token = generate_password_reset_token(user.email)
            Email.send_register_email(user, token)
            return (
                jsonify(
                    {
                        "message": "User registered successfully. A confirmation email has been sent."
                    }
                ),
                201,
            )
        except Exception as e:
            return (
                jsonify(
                    {
                        "message": "User registered successfully.",
                        "email_error": "Error sending registration email. Please check your email configuration or try again later.",
                        "error_details": str(e),
                    }
                ),
                202,
            )

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
    @token_required  # This decorator ensures that the user is logged in and has a valid token
    def change_password(current_user, *args, **kwargs):
        """
        Change the password for a logged-in user.
        """
        data = request.get_json()
        old_password = data.get("oldPassword")
        new_password = data.get("newPassword")

        if not old_password or not new_password:
            return (
                jsonify({"message": "Old password and new password are required"}),
                400,
            )

        # Validate old password
        if not check_password_hash(current_user.password, old_password):
            return jsonify({"message": "Old password is incorrect"}), 401

        # Add password complexity checks (optional but recommended)
        if len(new_password) < 6:  # Example: password must be at least 6 characters
            return (
                jsonify({"message": "New password must be at least 6 characters long"}),
                400,
            )

        # Update the password
        current_user.password = generate_password_hash(new_password)
        db.session.commit()

        return jsonify({"message": "Password changed successfully"}), 200

    # Forrgot Password
    @staticmethod
    def forget_password():
        """
        Initiates the password reset process by sending a reset link to the user's email.
        """
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"message": "Email is required"}), 400

        # Find user by email
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Generate a unique token (hashing email + a secret key)
        reset_token = hashlib.sha256(
            f"{user.email}{os.urandom(16)}".encode()
        ).hexdigest()

        # Store token in database with expiration time (e.g., 1 hour)
        user.reset_token = reset_token
        user.reset_token_expiry = dt.utcnow() + timedelta(hours=1)
        db.session.commit()

        # Send reset email with the token link
        reset_url = f"https://your-website.com/reset-password?token={reset_token}"
        # send_reset_email(user.email, reset_url)

        return jsonify({"message": "Reset link sent to your email"}), 200

    # Reset Password
    @staticmethod
    def reset_password():
        """
        Allows a user to reset their password using a valid token.
        """
        data = request.get_json()
        token = data.get("token")
        new_password = data.get("newPassword")

        if not token or not new_password:
            return jsonify({"message": "Token and new password are required"}), 400

        # Find the user by reset token
        user = User.query.filter_by(reset_token=token).first()

        if not user:
            return jsonify({"message": "Invalid or expired token"}), 400

        # Check if the token has expired
        if user.reset_token_expiry < dt.utcnow():
            return jsonify({"message": "Token has expired"}), 400

        # Update the password
        user.password = generate_password_hash(new_password)

        # Clear the reset token
        user.reset_token = None
        user.reset_token_expiry = None

        db.session.commit()

        return jsonify({"message": "Password reset successfully"}), 200

    # Sende Password Reset Link to Email
    @staticmethod
    def send_password_reset_link_to_user_email(email):
        """
        Send password reset link to email
        """
        data = request.get_json()
        email = data.get("email")

        user = User.query.filter_by(email=email).first()
        token = generate_password_reset_token(email)
        if not user:
            return jsonify({"message": "User not found"}), 404
        try:
            Email.send_password_reset_email(email, token)
            return jsonify({"message": "Password reset link sent to your email"}), 200
        except Exception as e:
            return (
                jsonify({"message": f"Error sending password reset link: {str(e)}"}),
                500,
            )

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

    # Get all users that the current user referral
    @staticmethod
    @token_required
    def get_referrals(current_user):
        """
        Get all users that the current user has referred.
        """
        print("current_user:::>", current_user)

        if current_user:
            # Query users where referrer_id matches current user's referral_code
            referrals = User.query.filter_by(referrer_id=current_user.id).all()

            # Serialize the referrals
            serialized_referrals = [referral.serialize() for referral in referrals]

            print("get_referrals:::>", serialized_referrals)

            return jsonify({"referrals": serialized_referrals}), 200
        else:
            return jsonify({"message": "User not found"}), 404


# Send reward notification
def send_reward_notification(user, reward):
    notification = Notification(
        user_id=user.id,
        message=f"You have received a reward of {reward:.2f} PDES.",
        is_read=False,
    )
    db.session.add(notification)
    db.session.commit()


def is_valid_email(email):
    regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    match = re.match(regex, email)
    return email if match else None


# Support Center
class SupportController:
    @staticmethod
    def validate_enum_value(value, enum_class):
        """
        Validates if the given value is a valid enum value.
        """
        if value not in [e.value for e in enum_class]:
            raise ValueError(
                f"Invalid value: '{value}'. Allowed values are: {[e.value for e in enum_class]}"
            )

    # User Creates a Ticket
    @staticmethod
    def create_ticket(user_id, title, description, priority="medium"):
        try:
            # Validate priority
            SupportController.validate_enum_value(priority, TicketPriority)

            ticket = SupportTicket(
                user_id=user_id,
                title=title,
                description=description,
                status=TicketStatus.OPEN.value,
                priority=priority,
            )
            db.session.add(ticket)
            db.session.commit()
            return {
                "success": True,
                "message": "Ticket created successfully!",
                "ticket_id": ticket.id,
            }
        except ValueError as ve:
            return {"success": False, "message": str(ve)}
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Error creating ticket: {str(e)}"}

    # Admin Assigns a Ticket
    @staticmethod
    def assign_ticket_to_admin(ticket_id, admin_id):
        try:
            ticket = SupportTicket.query.get(ticket_id)
            if not ticket:
                return {"success": False, "message": "Ticket not found."}

            # Validate current status
            if ticket.status != TicketStatus.OPEN.value:
                return {
                    "success": False,
                    "message": "Ticket is not open for assignment.",
                }

            ticket.admin_id = admin_id
            ticket.status = TicketStatus.IN_PROGRESS.value
            ticket.updated_at = datetime.utcnow()
            db.session.commit()
            return {
                "success": True,
                "message": "Ticket assigned to admin successfully.",
            }
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Error assigning ticket: {str(e)}"}

    # Admin or User Adds a Message
    @staticmethod
    def add_ticket_message(ticket_id, sender_id, sender_role, message):
        try:
            if sender_role not in ["user", "admin"]:
                return {"success": False, "message": "Invalid sender role."}

            ticket = SupportTicket.query.get(ticket_id)
            if not ticket:
                return {"success": False, "message": "Ticket not found."}

            ticket_message = SupportResponse(
                ticket_id=ticket_id,
                sender_id=sender_id,
                sender_role=sender_role,
                message=message,
            )
            ticket.updated_at = datetime.utcnow()
            db.session.add(ticket_message)
            db.session.commit()
            return {"success": True, "message": "Message added successfully."}
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Error adding message: {str(e)}"}

    # Admin Closes a Ticket
    @staticmethod
    def close_ticket(ticket_id):
        try:
            ticket = SupportTicket.query.get(ticket_id)
            if not ticket:
                return {"success": False, "message": "Ticket not found."}

            # Validate current status
            if ticket.status == TicketStatus.CLOSED.value:
                return {"success": False, "message": "Ticket is already closed."}

            ticket.status = TicketStatus.CLOSED.value
            ticket.updated_at = datetime.utcnow()
            db.session.commit()
            return {"success": True, "message": "Ticket closed successfully."}
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Error closing ticket: {str(e)}"}

    # Fetch Ticket Details
    @staticmethod
    def get_ticket_details(ticket_id):
        try:
            ticket = SupportTicket.query.get(ticket_id)
            if not ticket:
                return {"success": False, "message": "Ticket not found."}

            messages = (
                SupportResponse.query.filter_by(ticket_id=ticket_id)
                .order_by(SupportResponse.created_at)
                .all()
            )
            message_data = [
                {
                    "id": msg.id,
                    "sender_id": msg.sender_id,
                    "sender_role": msg.sender_role,
                    "message": msg.message,
                    "created_at": msg.created_at,
                }
                for msg in messages
            ]

            return {
                "success": True,
                "ticket": {
                    "id": ticket.id,
                    "title": ticket.title,
                    "description": ticket.description,
                    "status": ticket.status,
                    "priority": ticket.priority,
                    "created_at": ticket.created_at,
                    "updated_at": ticket.updated_at,
                    "user_id": ticket.user_id,
                    "admin_id": ticket.admin_id,
                    "messages": message_data,
                },
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error fetching ticket details: {str(e)}",
            }
