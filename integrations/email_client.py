import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger("CampusCompanion")

class EmailClient:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.sender_email = os.getenv("FROM_EMAIL", "noreply@campuscompanion.tcet.edu")
        self.sender_password = os.getenv("SMTP_PASSWORD", "") # Optional for Gmail app passwords
        self.use_sendgrid = os.getenv("SENDGRID_API_KEY") is not None

    def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = ""):
        """Send an HTML email"""
        if self.use_sendgrid:
            return self._send_via_sendgrid(to_email, subject, html_content)
        
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.sender_email
            msg["To"] = to_email

            part1 = MIMEText(text_content or subject, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                # If password is provided, attempt login
                if self.sender_password:
                    server.login(self.sender_email, self.sender_password)
                server.send_message(msg)
            
            logger.info(f"📧 Email sent to {to_email}: {subject}")
            return True
        except Exception as e:
            logger.error(f"❌ Email Failed: {e}")
            return False

    def _send_via_sendgrid(self, to_email: str, subject: str, html_content: str):
        """Send via SendGrid API"""
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        
        message = Mail(
            from_email=self.sender_email,
            to_emails=to_email,
            subject=subject,
            html_content=html_content)
        try:
            sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
            sg.send(message)
            logger.info(f"📧 SendGrid Email sent to {to_email}")
            return True
        except Exception as e:
            logger.error(f"❌ SendGrid Failed: {e}")
            return False

# Singleton instance
email_instance = EmailClient()
