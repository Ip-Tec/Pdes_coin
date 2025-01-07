import datetime
from flask import url_for, jsonify
from app.mail.mail import create_mail_app


# Initialize the app and mail
app, mail = create_mail_app()

def send_new_user_verification_email(user, token):
    """
    Send registration email with verification link to a new user.
    """
    # Generate verification token (use your preferred method)
    verification_token = token
    verification_url = url_for('verify_email', token=verification_token, _external=True)
    logo_url = "https://example.com/pdes-logo.png"  # Replace with your logo URL

    msg = Message(
        subject="Welcome to Our Service! Please Verify Your Email",
        sender=app.config["MAIL_USERNAME"],
        recipients=[user.email],
    )

    # HTML content
    msg.html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f6f6f6;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border: 1px solid #dddddd;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }}
            .email-header {{
                text-align: center;
                margin-bottom: 20px;
            }}
            .email-header img {{
                width: 120px;
                margin-bottom: 10px;
            }}
            .email-body {{
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                text-align: left;
            }}
            .email-footer {{
                margin-top: 20px;
                font-size: 14px;
                text-align: center;
                color: #999999;
            }}
            .verify-button {{
                display: inline-block;
                background-color: #1877f2;
                color: #ffffff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
            }}
            .verify-button:hover {{
                background-color: #165dce;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="{logo_url}" alt="PDES Logo">
            </div>
            <div class="email-body">
                <p>Hello {user.full_name},</p>
                <p>Welcome to our service! We're excited to have you on board.</p>
                <p>To get started, please verify your email address by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="{verification_url}" class="verify-button">Verify Email</a>
                </p>
                <p>If you didn’t sign up for this account, please ignore this email.</p>
                <p>Thank you,<br>The PDES Team</p>
            </div>
            <div class="email-footer">
                <p>© {datetime.datetime.now().year} PDES. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    mail.send(msg)
