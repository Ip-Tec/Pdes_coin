import os
import jwt
import secrets
import datetime
from app.models import User
from functools import wraps
from dotenv import load_dotenv
from flask import current_app, request, jsonify
from jwt import ExpiredSignatureError, InvalidTokenError
from app.utils import save_refresh_key_to_db, get_refresh_key_from_db


load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("SECRET_KEY")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Try to get token from cookies instead of headers
        token = request.cookies.get("access_token")
        
        # Bypass token checking for OPTIONS requests (preflight)
        if request.method == "OPTIONS":
            return jsonify({}), 200

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.get(data["user_id"])
        except ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401
        except InvalidTokenError:
            return jsonify({"message": "Token is invalid!"}), 401
        except Exception as e:
            return jsonify({"message": str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.now(datetime.timezone.utc)
        + datetime.timedelta(days=7, hours=1),  # Use full datetime reference
        "iat": datetime.datetime.now(datetime.timezone.utc),  # Issued at time
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload  # Return decoded user data
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token

# Token generation
def generate_access_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7, hours=1),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def generate_refresh_token(user_id):
    refresh_secret_key = secrets.token_hex(
        16
    )  # Generate a unique key for each refresh token
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow()
        + datetime.timedelta(days=7),  # Refresh token valid for 7 days
        "iat": datetime.datetime.utcnow(),
    }
    token = jwt.encode(payload, refresh_secret_key, algorithm="HS256")

    # Save the refresh secret key securely (e.g., database)
    save_refresh_key_to_db(user_id, refresh_secret_key)

    return token


# Token refresh
def refresh_access_token(refresh_token):
    try:
        # Decode without validation to get the user_id
        unverified_payload = jwt.decode(
            refresh_token, options={"verify_signature": False}
        )
        user_id = unverified_payload["user_id"]

        # Retrieve the refresh secret key for this user
        refresh_secret_key = get_refresh_key_from_db(user_id)
        if not refresh_secret_key:
            return jsonify({"message": "Invalid refresh token!"}), 401

        # Validate the token with the correct secret key
        data = jwt.decode(refresh_token, refresh_secret_key, algorithms=["HS256"])
        new_access_token = generate_access_token(data["user_id"])
        return jsonify({"access_token": new_access_token}), 200
    except ExpiredSignatureError:
        return jsonify({"message": "Refresh token has expired!"}), 401
    except InvalidTokenError:
        return jsonify({"message": "Invalid refresh token!"}), 401
    except Exception as e:
        return jsonify({"message": str(e)}), 401


# Verify password reset token
def verify_reset_token(token):
    """
    Verify the reset password token.
    :param token: JWT token to verify
    :return: Decoded payload if valid, None otherwise
    """
    try:
        # Decode the token using the secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload  # Contains user data such as email or user_id
    except ExpiredSignatureError:
        return {"error": "Token has expired!"}
    except InvalidTokenError:
        return {"error": "Token is invalid!"}
    except Exception as e:
        return {"error": str(e)}


# Generate password reset token
def generate_password_reset_token(email):
    """
    Generate a password reset token for the given email.
    :param email: User's email
    :return: Encoded JWT token
    """
    user = User.query.filter_by(email=email).first()
    if not user:
        return None

    payload = {
        "user_id": user.id,
        "email": user.email,
        "exp": datetime.datetime.now(datetime.timezone.utc)
        + datetime.timedelta(minutes=30),  # Token expires in 30 minutes
        "iat": datetime.datetime.now(datetime.timezone.utc),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token


