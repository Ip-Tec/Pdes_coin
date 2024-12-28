from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object("app.config.Config")
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)  # Enable CORS for cross-origin requests
    
    # Register blueprints
    from app.routes import auth, users, transactions
    app.register_blueprint(auth.auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users.users_bp, url_prefix="/api/users")
    app.register_blueprint(transactions.txn_bp, url_prefix="/api/transactions")
    
    return app
