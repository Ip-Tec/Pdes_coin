import os
from flask_cors import CORS

# from requests import request
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from werkzeug.exceptions import HTTPException

db = SQLAlchemy()
migrate = Migrate()
socketio = SocketIO(
    cors_allowed_origins=[
        "https://vercel.app",
        "http://localhost:5173",
        "https://pedex.vercel.app",
        "https://pedex.duckdns.org",
        "https://pedex.onrender.com/",
        "https://pedex.onrender.com/",
        "https://pdes-coin.vercel.app",
    ],
    async_mode="eventlet",
)
# Initialize globally
load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    # Error handlers
    @app.errorhandler(Exception)
    def handle_exception(e):
        if isinstance(e, HTTPException):
            response = e.get_response()
            response.data = jsonify(
                {"error": e.name, "message": e.description, "status": e.code}
            ).data
            response.content_type = "application/json"
            return response
        return jsonify({"error": "Server Error", "message": str(e)}), 500

    @app.errorhandler(404)
    def not_found(e):
        return (
            jsonify(
                {
                    "error": "Not Found",
                    "message": "The requested URL was not found on the server.",
                }
            ),
            404,
        )

    @app.errorhandler(500)
    def internal_server_error(e):
        return (
            jsonify({"error": "Internal Server Error", "message": str(e)}),
            500,
        )

    # CORS configuration
    CORS(
        app,
        supports_credentials=True,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://pedex.vercel.app",
                    "https://pedex.duckdns.org",
                    "https://pedex.vercel.app",
                    "https://pedex.onrender.com/",
                    "https://pedex.onrender.com/",
                    "https://pdes-coin.vercel.app",
                ],
                "allow_headers": ["Content-Type", "Authorization"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            }
        },
    )

    # Load configuration
    app.config.from_object("app.config.Config")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(
        app,
        cors_allowed_origins="*",
        async_mode="eventlet",
        transports=["websocket", "polling"],
        logger=True,  # Add logging
        engineio_logger=True,  # Add detailed logging
    )
    # Attach Socket.IO to the Flask app

    # Setup routes
    @app.route("/api", methods=["GET"])
    def index():
        return jsonify({"message": "Welcome to the Pdes Wallet API!"}), 200

    # Register blueprints
    from app.routes import (
        admin,
        auth,
        correction,
        users,
        transactions,
        account,
        utility,
        support,
    )

    app.register_blueprint(auth.auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin.admin_bp, url_prefix="/api/admin")
    app.register_blueprint(users.users_bp, url_prefix="/api/users")
    app.register_blueprint(support.support_bp, url_prefix="/support")
    app.register_blueprint(account.account_bp, url_prefix="/api/account")
    app.register_blueprint(utility.utility_bp, url_prefix="/api/utility")
    app.register_blueprint(correction.correct_bp, url_prefix="/correct_db")
    app.register_blueprint(transactions.txn_bp, url_prefix="/api/transactions")

    # Shell context for debugging
    @app.shell_context_processor
    def make_shell_context():
        from app.models import User, Transaction, Crypto, Balance, AccountDetail

        return {
            "db": db,
            "User": User,
            "Transaction": Transaction,
            "Crypto": Crypto,
            "Balance": Balance,
            "Account": AccountDetail,
        }

    # Import and bind socket events after app creation to avoid circular import
    from app.events import register_socketio_events

    register_socketio_events(socketio)

    return app
