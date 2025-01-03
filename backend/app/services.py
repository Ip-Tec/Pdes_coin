import jwt
from app.models import User
from functools import wraps
from flask import current_app, request, jsonify
from jwt import ExpiredSignatureError, InvalidTokenError

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        print({"Authorization Header": token})

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        # Handle Bearer token format
        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        try:
            SECRET_KEY = current_app.config["SECRET_KEY"]
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
        "exp": datetime.utcnow() + timedelta(hours=1),  # Token expires in 1 hour
        "iat": datetime.utcnow()  # Issued at time
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")