from app import db
from flask import jsonify
from app.models import User

def validate_required_param(param_value, param_name):
    """
    Validates that a given parameter is not None or empty.
    
    Args:
        param_value: The value of the parameter to validate.
        param_name: The name of the parameter (used in the error message).
    
    Returns:
        A tuple with a response (status code, message) if the validation fails, 
        or None if the validation is successful.
    """
    if not param_value:
        return jsonify({"message": f"{param_name} is required"}), 400
    return None




def save_refresh_key_to_db(user_id, refresh_secret_key):
    """
    Save the refresh secret key for a user in the database.
    """
    user = User.query.get(user_id)
    if user:
        user.refresh_key = refresh_secret_key
        db.session.commit()

def get_refresh_key_from_db(user_id):
    """
    Retrieve the refresh secret key for a user from the database.
    """
    user = User.query.get(user_id)
    if user:
        return user.refresh_key
    return None
