import os
from flask_cors import CORS
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, jsonify
from flask_socketio import SocketIO
from werkzeug.exceptions import HTTPException

db = SQLAlchemy()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="*", async_mode="eventlet")  # Initialize globally
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

    # CORS configuration
    CORS(
        app,
        supports_credentials=True,
        resources={
            r"/*": {
                "origins": [
                    "https://vercel.app",
                    "http://localhost:5173",
                    "https://pdes-coin.vercel.app",
                ]
            }
        },
    )

    # Load configuration
    app.config.from_object("app.config.Config")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app, cors_allowed_origins="*", async_mode="eventlet")  # Attach Socket.IO to the Flask app

    # Setup routes
    @app.route("/", methods=["GET"])
    def index():
        return jsonify({"message": "Welcome to the Pdes Wallet API!"}), 200

    # Register blueprints
    from app.routes import admin, auth, correction, users, transactions, account, utility

    app.register_blueprint(auth.auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin.admin_bp, url_prefix="/api/admin")
    app.register_blueprint(users.users_bp, url_prefix="/api/users")
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
    from app.events import register_socketio_events, emit
    register_socketio_events(socketio)
    
    
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        emit('connected', {'message': 'You are connected'})

    @socketio.on('get_transaction_history')
    def handle_transaction_history(data):
        print('Received get_transaction_history')
        # Simulate transaction history
        transactions = [{"id": 1, "amount": 100}, {"id": 2, "amount": 200}]
        emit('transaction_history', {'transactions': transactions})

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')


    return app
