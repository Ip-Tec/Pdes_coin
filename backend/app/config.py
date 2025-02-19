import os
from .key_gen import generate_key

class Config:
    SECRET_KEY = "1b5636aeec1625dc42a891a6f4d1be8d24258ec7ecace68d"
    
    # Determine if running in production
    ENV = os.getenv("FLASK_ENV", "development")  # Default to development if not set
    # SQLALCHEMY_DATABASE_URI = "sqlite:///pdes_DB.sqlite3"

    if ENV == "production":
        SQLALCHEMY_DATABASE_URI = os.getenv("PROD_DATABASE_URL", "mysql+mysqlconnector://root:ip203@102.210.146.148/pedex")
    else:
        SQLALCHEMY_DATABASE_URI = os.getenv("DEV_DATABASE_URL", "mysql+mysqlconnector://root@localhost:3306/pdes")

    SQLALCHEMY_TRACK_MODIFICATIONS = False
