import requests
import os
from django.conf import settings

class PaystackService:
    """
    Service to handle Paystack payment initialization and verification.
    """
    def __init__(self):
        self.secret_key = os.getenv('PAYSTACK_SECRET_KEY')
        self.base_url = "https://api.paystack.co"
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }

    def initialize_transaction(self, email, amount_in_naira, metadata=None):
        """
        Initializes a transaction and returns the authorization URL.
        Amount must be in kobo (Naira * 100).
        """
        url = f"{self.base_url}/transaction/initialize"
        data = {
            "email": email,
            "amount": int(amount_in_naira * 100), # Convert to kobo
            "metadata": metadata or {},
        }
        
        try:
            response = requests.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            res_json = response.json()
            if res_json['status']:
                return res_json['data'] # Contains 'authorization_url' and 'reference'
            return None
        except requests.exceptions.RequestException as e:
            # TODO: Add proper logging
            print(f"Paystack Init Error: {e}")
            return None

    def verify_transaction(self, reference):
        """
        Verifies a transaction using its reference.
        """
        url = f"{self.base_url}/transaction/verify/{reference}"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            res_json = response.json()
            if res_json['status']:
                return res_json['data'] # Contains status, amount, metadata, etc.
            return None
        except requests.exceptions.RequestException as e:
            print(f"Paystack Verify Error: {e}")
            return None
