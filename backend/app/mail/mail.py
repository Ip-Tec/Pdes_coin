import os
from flask import Flask
from flask_mail import Mail

def create_mail_app():
    """
    Configure and return a Flask app with mail settings
    """
    app = Flask(__name__)
    app.config['MAIL_SERVER'] = 'smtp.example.com'  # Replace with your SMTP server
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USE_TLS'] = False
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

    mail = Mail(app)
    return app, mail
