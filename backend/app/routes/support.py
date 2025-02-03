from app import db
from app.access_level import AccessLevel
from app.services import token_required
from flask import Blueprint, request, jsonify
from app.models import SupportTicket, SupportResponse

support_bp = Blueprint("support", __name__)

# -----------------------------
# Create a new support ticket
# Accessible to all authenticated users (all roles)
# -----------------------------
@support_bp.route("/create-ticket", methods=["POST"])
@token_required
@AccessLevel.role_required(["USER", "SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def create_ticket(current_user, *args, **kwargs):
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    priority = data.get("priority", "MEDIUM")  # Default priority is MEDIUM

    if not title or not description:
        return jsonify({"message": "Title and description are required."}), 400

    ticket = SupportTicket(
        user_id=current_user.id,
        title=title,
        description=description
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify({"message": "Support ticket created successfully.", "ticket_id": ticket.id}), 201


# -----------------------------
# Get tickets for the current user
# Accessible to all authenticated users (all roles)
# -----------------------------
@support_bp.route("/my-tickets", methods=["GET"])
@token_required
@AccessLevel.role_required(["USER", "SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def get_my_tickets(current_user, *args, **kwargs):
    tickets = SupportTicket.query.filter_by(user_id=current_user.id).all()
    results = []
    for ticket in tickets:
        results.append({
            "id": ticket.id,
            "title": ticket.title,
            "description": ticket.description,
            "status": ticket.status,
            "priority": ticket.priority,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
            "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None
        })
    return jsonify(results), 200


# -----------------------------
# Get all support tickets
# Only accessible to support staff and above (exclude plain USER)
# -----------------------------
@support_bp.route("/all-tickets", methods=["GET"])
@token_required
@AccessLevel.role_required(["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def get_all_tickets(current_user, *args, **kwargs):
    tickets = SupportTicket.query.all()
    results = []
    for ticket in tickets:
        # Optionally include user info
        results.append({
            "id": ticket.id,
            "title": ticket.title,
            "description": ticket.description,
            "status": ticket.status,
            "priority": ticket.priority,
            "user_id": ticket.user_id,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
            "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None
        })
    return jsonify(results), 200


# -----------------------------
# Add a response to a support ticket
# Accessible to all authenticated users (so users can reply on their own ticket and support can reply as well)
# -----------------------------
@support_bp.route("/respond-ticket", methods=["POST"])
@token_required
@AccessLevel.role_required(["USER", "SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def respond_ticket(current_user, *args, **kwargs):
    data = request.get_json()
    ticket_id = data.get("ticket_id")
    message = data.get("message")

    if not ticket_id or not message:
        return jsonify({"message": "Ticket ID and message are required."}), 400

    ticket = SupportTicket.query.get(ticket_id)
    if not ticket:
        return jsonify({"message": "Ticket not found."}), 404

    # Determine sender role from the current user's role
    sender_role = current_user.role.upper()

    response = SupportResponse(
        ticket_id=ticket.id,
        user_id=current_user.id,
        sender_role=sender_role,
        message=message
    )
    db.session.add(response)
    db.session.commit()
    return jsonify({"message": "Response added successfully.", "response_id": response.id}), 201


# -----------------------------
# Update a ticket's status
# Only accessible to support staff and above (no plain USER)
# -----------------------------
@support_bp.route("/update-ticket-status", methods=["POST"])
@token_required
@AccessLevel.role_required(["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"])
def update_ticket_status(current_user, *args, **kwargs):
    data = request.get_json()
    ticket_id = data.get("ticket_id")
    new_status = data.get("status")  # For example, 'OPEN', 'IN_PROGRESS', or 'RESOLVED'

    if not ticket_id or not new_status:
        return jsonify({"message": "Ticket ID and new status are required."}), 400

    ticket = SupportTicket.query.get(ticket_id)
    if not ticket:
        return jsonify({"message": "Ticket not found."}), 404

    # Optionally, validate new_status against allowed values (e.g., using your TicketStatus enum)
    ticket.status = new_status
    db.session.commit()
    return jsonify({"message": "Ticket status updated successfully."}), 200
