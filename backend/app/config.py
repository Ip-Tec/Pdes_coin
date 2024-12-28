from .key_gen import generate_key
class Config:
    SECRET_KEY = generate_key(48)
    SQLALCHEMY_DATABASE_URI = "sqlite:///pdes_DB.sqlite3"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
