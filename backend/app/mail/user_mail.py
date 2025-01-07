from flask import url_for
from flask_mail import Message
from app.mail.mail import create_mail_app
from app.mail import new_user, reset_password

# Initialize the app and mail
app, mail = create_mail_app()


# Email Class
class Email:
    def __init__(self, subject, sender, recipients, body=None, html=None):
        self.subject = subject
        self.sender = sender
        self

    def send_register_email(user, token):
        """
        Send registration email to a new user.
        """

        return new_user.send_new_user_verification_email(user, token)

    def send_deposit_email(recipient, username, amount):
        """
        Send email notification for a deposit.
        """
        msg = Message(
            subject="Deposit Confirmation",
            sender=app.config["MAIL_USERNAME"],
            recipients=[recipient],
        )
        msg.body = f"Hello {username},\n\nYour deposit of ${amount} was successful."
        mail.send(msg)

    def send_withdrawal_email(recipient, username, amount):
        """
        Send email notification for a withdrawal.
        """
        msg = Message(
            subject="Withdrawal Confirmation",
            sender=app.config["MAIL_USERNAME"],
            recipients=[recipient],
        )
        msg.body = f"Hello {username},\n\nYour withdrawal of ${amount} was successful."
        mail.send(msg)

    def send_password_reset_email(email, token):
        """
        Send a styled password reset email with a logo and link.
        """
        return reset_password.send_password_reset_email(email, token)

    def send_delete_account_email(recipient, reset_link):
        """
        Send password reset email with a link.
        """
        msg = Message(
            subject="About to Delete Your Account",
            sender=app.config["MAIL_USERNAME"],
            recipients=[recipient],
        )
        msg.body = f"Hello,\n\nClick the link below to delete your account:\n{reset_link}\n\nIf you did not want to delete your, please ignore this email."
        mail.send(msg)
