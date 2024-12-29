from app.mail.mail import create_mail_app
from flask_mail import Message

# Initialize the app and mail
app, mail = create_mail_app()

# Email Functions
def send_register_email(recipient, username):
    """
    Send registration email to a new user.
    """
    msg = Message(
        subject="Welcome to Our Service!",
        sender=app.config['MAIL_USERNAME'],
        recipients=[recipient]
    )
    msg.body = f"Hello {username},\n\nThank you for registering with us!"
    mail.send(msg)

def send_deposit_email(recipient, username, amount):
    """
    Send email notification for a deposit.
    """
    msg = Message(
        subject="Deposit Confirmation",
        sender=app.config['MAIL_USERNAME'],
        recipients=[recipient]
    )
    msg.body = f"Hello {username},\n\nYour deposit of ${amount} was successful."
    mail.send(msg)

def send_withdrawal_email(recipient, username, amount):
    """
    Send email notification for a withdrawal.
    """
    msg = Message(
        subject="Withdrawal Confirmation",
        sender=app.config['MAIL_USERNAME'],
        recipients=[recipient]
    )
    msg.body = f"Hello {username},\n\nYour withdrawal of ${amount} was successful."
    mail.send(msg)

def send_password_reset_email(recipient, reset_link):
    """
    Send password reset email with a link.
    """
    msg = Message(
        subject="Password Reset Request",
        sender=app.config['MAIL_USERNAME'],
        recipients=[recipient]
    )
    msg.body = f"Hello,\n\nClick the link below to reset your password:\n{reset_link}\n\nIf you did not request a password reset, please ignore this email."
    mail.send(msg)


def send_delete_account_email(recipient, reset_link):
    """
    Send password reset email with a link.
    """
    msg = Message(
        subject="About to Delete Your Account",
        sender=app.config['MAIL_USERNAME'],
        recipients=[recipient]
    )
    msg.body = f"Hello,\n\nClick the link below to delete your account:\n{reset_link}\n\nIf you did not want to delete your, please ignore this email."
    mail.send(msg)
