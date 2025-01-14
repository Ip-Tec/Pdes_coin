import os
import jwt
from functools import wraps
from app.models import User
from dotenv import load_dotenv
from flask import request, jsonify
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

# Secret key for JWT decoding
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("SECRET_KEY")

class AccessLevel:
    # Define access levels
    USER = 1
    ADMIN = 2
    SUPER_ADMIN = 3
    DEVELOPER = 4

    # Define access level names
    ACCESS_LEVEL_NAMES = {
        USER: "User",
        ADMIN: "Admin",
        SUPER_ADMIN: "Super Admin",
        DEVELOPER: "Developer",
    }

    # Define access level descriptions
    ACCESS_LEVEL_DESCRIPTIONS = {
        USER: "Regular user with limited access.",
        ADMIN: "Administrator with advanced access.",
        SUPER_ADMIN: "Super admin with full access.",
        DEVELOPER: "Super admin with full access and developer access.",
    }

    # Define access level permissions
    ACCESS_LEVEL_PERMISSIONS = {
        USER: ["read"],
        ADMIN: ["read", "write"],
        SUPER_ADMIN: ["read", "write", "delete"],
        DEVELOPER: ["read", "write", "edit", "delete"],
    }

    @staticmethod
    def decode_token(token):
        """
        Decodes the JWT token and retrieves the user data.
        """
        try:
            if token.startswith("Bearer "):
                token = token.split(" ")[1]
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return data
        except ExpiredSignatureError:
            raise ValueError("Token has expired!")
        except InvalidTokenError:
            raise ValueError("Token is invalid!")
        except Exception as e:
            raise ValueError(str(e))

    @staticmethod
    def role_required(required_role):
        """
        Decorator to restrict access to users with the specified role.
        """

        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                token = request.headers.get("Authorization")
                if not token:
                    return jsonify({"message": "Token is missing!"}), 401

                try:
                    data = AccessLevel.decode_token(token)
                    current_user = User.query.get(data["user_id"])
                except ValueError as e:
                    return jsonify({"message": str(e)}), 401

                if current_user.role != required_role:
                    return (
                        jsonify(
                            {
                                "message": f"Access denied. {required_role.capitalize()} role required!"
                            }
                        ),
                        403,
                    )

                return f(current_user, *args, **kwargs)

            return decorated_function

        return decorator

    # Define specific decorators for roles
    admin_required = role_required("admin")
    super_admin_required = role_required("developer")
