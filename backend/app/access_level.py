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
    SUPPORT = 2
    MODERATOR = 3
    ADMIN = 4
    SUPER_ADMIN = 5
    DEVELOPER = 6
    OWNER = 7  # Highest level with full unrestricted access

    # Define access level names
    ACCESS_LEVEL_NAMES = {
        USER: "User",
        SUPPORT: "Support",
        MODERATOR: "Moderator",
        ADMIN: "Admin",
        SUPER_ADMIN: "Super Admin",
        DEVELOPER: "Developer",
        OWNER: "Owner",
    }

    # Define access level descriptions
    ACCESS_LEVEL_DESCRIPTIONS = {
        USER: "Regular user with limited access.",
        SUPPORT: "Support staff with basic privileges to assist users.",
        MODERATOR: "Can manage user content and handle reports.",
        ADMIN: "Administrator with advanced access.",
        SUPER_ADMIN: "Super admin with full control over the platform.",
        DEVELOPER: "Super admin with additional debugging and system-level access.",
        OWNER: "Owner with unrestricted access, including system-wide control.",
    }

    # Define access level permissions
    ACCESS_LEVEL_PERMISSIONS = {
        USER: ["read"],
        SUPPORT: ["read", "respond"],  # Can read and provide limited responses
        MODERATOR: ["read", "write", "manage_users"],  # More control than support but less than admin
        ADMIN: ["read", "write", "manage_users", "ban_users"],  # Full admin privileges except deletion
        SUPER_ADMIN: ["read", "write", "delete", "manage_roles"],  # Can manage roles and delete data
        DEVELOPER: ["read", "write", "edit", "delete", "debug"],  # Additional permissions for debugging
        OWNER: ["read", "write", "edit", "delete", "manage_roles", "ban_users", "debug", "full_control"],  # Full unrestricted access
    }

    @classmethod
    def get_role_name(cls, level):
        """Get role name by level."""
        return cls.ACCESS_LEVEL_NAMES.get(level, "Unknown")

    @classmethod
    def get_role_description(cls, level):
        """Get role description by level."""
        return cls.ACCESS_LEVEL_DESCRIPTIONS.get(level, "No description available.")

    @classmethod
    def get_permissions(cls, level):
        """Get permissions for a given access level."""
        return cls.ACCESS_LEVEL_PERMISSIONS.get(level, [])

    @classmethod
    def has_permission(cls, level, permission):
        """Check if an access level has a specific permission."""
        return permission in cls.get_permissions(level)


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
    def role_required(roles):
        def decorator(f):
            @wraps(f)
            def decorated_function(current_user, *args, **kwargs):
                # Check if the user is in the required roles
                if current_user.role not in roles:
                    return jsonify({"message": "Unauthorized access"}), 403
                return f(current_user, *args, **kwargs)
            return decorated_function
        return decorator
