from .key_gen import generate_key
class Config:
    SECRET_KEY = "1b5636aeec1625dc42a891a6f4d1be8d24258ec7ecace68d"
    # SQLALCHEMY_DATABASE_URI = "sqlite:///pdes_DB.sqlite3"
    SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://ip203:IP~!pedex@102.210.146.148/pdes" # PROD DB
    # SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://root@localhost:3306/pdes" # LOCAL DB
    SQLALCHEMY_TRACK_MODIFICATIONS = False
