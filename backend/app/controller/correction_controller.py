from app import db
from app.models import User
from flask import Blueprint, request, jsonify


def update_correct_balance(user_id, new_correct_balance):
    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found"}
    
    user.correct_balance = new_correct_balance
    db.session.commit()
    return {"message": "Correct balance updated successfully", "correct_balance": user.correct_balance}

def check_balance_discrepancy(user_id):
    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found"}
    
    if user.balance != user.correct_balance:
        discrepancy = user.correct_balance - user.balance
        return {"discrepancy": discrepancy, "message": "Balance mismatch detected"}
    return {"message": "Balance is correct"}

def handle_balance_issue(user_id, new_correct_balance):
    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found"}
    
    user.correct_balance = new_correct_balance
    if user.balance != user.correct_balance:
        user.sticks += 1
        if user.sticks >= 3:
            user.is_blocked = True
        message = "Balance mismatch detected. Stick added."
    else:
        message = "Balance is correct. No action taken."
    
    db.session.commit()
    return {"message": message, "sticks": user.sticks, "is_blocked": user.is_blocked}

