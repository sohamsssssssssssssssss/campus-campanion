import razorpay
import os
import hmac
import hashlib
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()

class RazorpayClient:
    def __init__(self):
        self.key_id = os.getenv("RAZORPAY_KEY_ID", "rzp_test_placeholder")
        self.key_secret = os.getenv("RAZORPAY_KEY_SECRET", "secret_placeholder")
        self.client = razorpay.Client(auth=(self.key_id, self.key_secret))

    def create_order(self, amount: int, currency: str = "INR", receipt: str = None) -> Dict:
        """
        Create a Razorpay order
        amount: In paise (e.g. 50000 for ₹500)
        """
        data = {
            "amount": amount,
            "currency": currency,
            "receipt": receipt,
            "payment_capture": 1 # Auto-capture payment
        }
        return self.client.order.create(data=data)

    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """
        Verify the signature of a successful payment
        """
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            self.client.utility.verify_payment_signature(params_dict)
            return True
        except Exception as e:
            print(f"Razorpay Signature Verification Failed: {e}")
            return False

# Singleton instance
razorpay_instance = RazorpayClient()
