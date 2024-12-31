from flask import jsonify

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