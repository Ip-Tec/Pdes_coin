import os
from flask_cors import CORS
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from werkzeug.exceptions import HTTPException

db = SQLAlchemy()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="*")  # Initialize globally
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
        resources={r"/*": {"origins": ["http://localhost:5173", "https://pdes-coin.vercel.app"]}},
    )

    # Load configuration
    app.config.from_object("app.config.Config")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)  # Attach SocketIO to the Flask app

    # Setup routes
    @socketio.on("connect")
    def handle_connect():
        print("Client connected")
        emit("response", {"message": "Welcome to the server!"})
        
    @app.route("/", methods=["GET"])
    def index():
        return jsonify({"message": "Welcome to the Pdes Wallet API!"}), 200

    # Register blueprints
    from app.routes import auth, users, transactions, account, utility

    app.register_blueprint(auth.auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users.users_bp, url_prefix="/api/users")
    app.register_blueprint(account.account_bp, url_prefix="/api/account")
    app.register_blueprint(utility.utility_bp, url_prefix="/api/utility")
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

    return app

    # Handle preflight requests
    # @app.before_request
    # def handle_options():
    #     if request.method == "OPTIONS":
    #         response = app.make_response("")
    #         response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    #         response.headers["Access-Control-Allow-Methods"] = (
    #             "GET, POST, PUT, DELETE, OPTIONS"
    #         )
    #         response.headers["Access-Control-Allow-Headers"] = (
    #             "Content-Type, Authorization, X-Requested-With"
    #         )
    #         response.headers["Access-Control-Allow-Credentials"] = "true"
    #         return response, 200

    # Load configuration
