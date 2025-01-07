import datetime
from flask_mail import Message
from flask import url_for, jsonify
from app.mail.mail import create_mail_app


# Initialize the app and mail
app, mail = create_mail_app()


def send_password_reset_email(email, token):
    """
    Send a styled password reset email with a logo and link.
    """
    reset_url = url_for("reset_password", token=token, _external=True)
    logo_url = "https://example.com/pdes-logo.png"  # Replace with your actual logo URL

    msg = Message(
        subject="Password Reset Request",
        sender=app.config["MAIL_USERNAME"],
        recipients=[email],
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
            .reset-button {{
                display: inline-block;
                background-color: #1877f2;
                color: #ffffff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
            }}
            .reset-button:hover {{
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
                <p>Hi,</p>
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" class="reset-button">Reset Password</a>
                </p>
                <p>If you didn’t request a password reset, you can ignore this email.</p>
                <p>Thanks,<br>The PDES Team</p>
            </div>
            <div class="email-footer">
                <p>© {datetime.datetime.now().year} PDES. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    mail.send(msg)

    return jsonify({"message": "Password reset email sent successfully."}), 200
