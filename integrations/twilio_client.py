from twilio.rest import Client
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger("CampusCompanion")

class TwilioClient:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID", "AC_placeholder")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN", "token_placeholder")
        self.whatsapp_number = os.getenv("TWILIO_WHATSAPP_NUMBER", "+14155238886")
        self.sms_number = os.getenv("TWILIO_SMS_NUMBER", "+1234567890")
        
        try:
            self.client = Client(self.account_sid, self.auth_token)
        except Exception as e:
            logger.warning(f"⚠️ Twilio Client init failed (likely placeholders): {e}")

    def send_sms(self, to_number: str, message: str):
        """Send a standard SMS"""
        try:
            msg = self.client.messages.create(
                body=message,
                from_=self.sms_number,
                to=to_number
            )
            logger.info(f"📱 SMS sent to {to_number}: {msg.sid}")
            return True
        except Exception as e:
            logger.error(f"❌ SMS Failed: {e}")
            return False

    def send_whatsapp(self, to_number: str, message: str):
        """Send a WhatsApp message"""
        try:
            # WhatsApp numbers must be prefixed with 'whatsapp:'
            formatted_to = f"whatsapp:{to_number}" if not to_number.startswith("whatsapp:") else to_number
            formatted_from = f"whatsapp:{self.whatsapp_number}" if not self.whatsapp_number.startswith("whatsapp:") else self.whatsapp_number
            
            msg = self.client.messages.create(
                body=message,
                from_=formatted_from,
                to=formatted_to
            )
            logger.info(f"💬 WhatsApp sent to {to_number}: {msg.sid}")
            return True
        except Exception as e:
            logger.error(f"❌ WhatsApp Failed: {e}")
            return False

# Singleton instance
twilio_instance = TwilioClient()
